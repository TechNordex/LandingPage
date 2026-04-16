import { Pool } from 'pg'

declare global {
    // eslint-disable-next-line no-var
    var pgPool: any
}

// Mocking the database connection pool entirely
// This ensures the landing page does not attempt to connect to the production database.
export const db = globalThis.pgPool ?? ({
    query: async () => { 
        console.warn("BLOCKED DB QUERY"); 
        return { rows: [], rowCount: 0 }; 
    },
    connect: async () => ({ 
        release: () => {}, 
        query: async () => ({ rows: [], rowCount: 0 }) 
    }),
    on: () => {},
    end: async () => {}
} as unknown as Pool);

if (process.env.NODE_ENV !== 'production') {
    globalThis.pgPool = db
}
