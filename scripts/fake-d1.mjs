export function createFakeD1() {
  const state = {
    apps: new Map(),
    items: new Map(),
    pushDevices: new Map(),
  };

  return {
    state,
    prepare(sql) {
      const params = [];
      return statement(state, sql, params);
    },
  };
}

function statement(state, sql, params) {
  return {
    bind(...values) {
      return statement(state, sql, values);
    },
    async all() {
      const rows = queryRows(state, sql, params);
      return { results: rows };
    },
    async first() {
      const rows = queryRows(state, sql, params);
      return rows[0] || null;
    },
    async run() {
      mutate(state, sql, params);
      return { success: true };
    },
  };
}

function queryRows(state, sql, params) {
  const normalized = normalize(sql);
  if (normalized.includes("select count(*) as count from app_meta")) {
    return [{ count: active(state.apps).length }];
  }
  if (normalized.includes("select count(*) as count from grocery_items")) {
    return [{ count: active(state.items).length }];
  }
  if (normalized.includes("from app_meta where id =")) {
    const row = state.apps.get(params[0]);
    return row && !row.deleted_at ? [row] : [];
  }
  if (normalized.includes("from app_meta where (slug =")) {
    const row = active(state.apps).find((app) => app.slug === params[0] || app.path === params[1]);
    return row ? [row] : [];
  }
  if (normalized.includes("select token from push_devices")) {
    return [...state.pushDevices.values()];
  }
  if (normalized.includes("from grocery_items where id =")) {
    const row = state.items.get(params[0]);
    return row && !row.deleted_at ? [row] : [];
  }
  if (normalized.includes("from app_meta")) {
    return active(state.apps).sort((a, b) => {
      const statusDelta = appStatusRank(a.status) - appStatusRank(b.status);
      if (statusDelta) return statusDelta;
      const sortDelta = Number(a.sort_order) - Number(b.sort_order);
      if (sortDelta) return sortDelta;
      return a.name.localeCompare(b.name);
    });
  }
  if (normalized.includes("from grocery_items")) {
    return active(state.items).sort((a, b) => {
      const statusDelta = itemStatusRank(a.status) - itemStatusRank(b.status);
      if (statusDelta) return statusDelta;
      const typeDelta = itemTypeRank(a.list_type) - itemTypeRank(b.list_type);
      if (typeDelta) return typeDelta;
      const sortDelta = Number(a.sort_order) - Number(b.sort_order);
      if (sortDelta) return sortDelta;
      return a.name.localeCompare(b.name);
    });
  }
  return [];
}

function mutate(state, sql, params) {
  const normalized = normalize(sql);
  if (normalized.startsWith("create table") || normalized.startsWith("create index")) return;
  if (normalized.includes("insert into app_meta")) {
    const row = {
      id: params[0],
      name: params[1],
      slug: params[2],
      path: params[3],
      url: params[4],
      category: params[5],
      runtime: params[6],
      visibility: params[7],
      status: params[8],
      accent: params[9],
      icon: params[10],
      notes: params[11],
      sort_order: params[12],
      created_at: params[13],
      updated_at: params[14],
      deleted_at: null,
    };
    state.apps.set(row.id, row);
    return;
  }
  if (normalized.includes("insert into grocery_items")) {
    const row = {
      id: params[0],
      name: params[1],
      list_type: params[2],
      status: params[3],
      category: params[4],
      quantity: params[5],
      notes: params[6],
      aisle: params[7],
      modified_by: params[8],
      last_purchased_at: params[9],
      sort_order: params[10],
      created_at: params[11],
      updated_at: params[12],
      deleted_at: null,
    };
    state.items.set(row.id, row);
    return;
  }
  if (normalized.includes("insert into push_devices")) {
    state.pushDevices.set(params[0], { token: params[0], platform: params[1], created_at: params[2] });
    return;
  }
  if (normalized.includes("delete from push_devices")) {
    state.pushDevices.delete(params[0]);
    return;
  }
  if (normalized.includes("update app_meta set deleted_at")) {
    const row = state.apps.get(params[2]);
    if (row) {
      row.deleted_at = params[0];
      row.updated_at = params[1];
    }
    return;
  }
  if (normalized.includes("update grocery_items set deleted_at")) {
    const row = state.items.get(params[2]);
    if (row) {
      row.deleted_at = params[0];
      row.updated_at = params[1];
    }
  }
}

function active(map) {
  return [...map.values()].filter((row) => !row.deleted_at);
}

function normalize(sql) {
  return sql.toLowerCase().replace(/\s+/g, " ").trim();
}

function appStatusRank(status) {
  return status === "live" ? 1 : status === "draft" ? 2 : 3;
}

function itemStatusRank(status) {
  return { need: 1, low: 2, have: 3, bought: 4, skipped: 5 }[status] || 6;
}

function itemTypeRank(type) {
  return { essential: 1, occasional: 2, pantry: 3 }[type] || 4;
}
