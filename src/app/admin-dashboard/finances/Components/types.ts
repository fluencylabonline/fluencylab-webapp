    // Represents a single transaction
    export type Transaction = {
        id?: string; // Optional since Firestore generates the ID
        date: string; // Stored as ISO string (YYYY-MM-DD)
        type: "entrada" | "gasto"; // Defines whether it's income or expense
        category: "mensalidade" | "despesa" | "professor" | "cancelamento"; // Transaction category
        value: number | null; // Transaction value
        name: string; // Name/description of the transaction
        studentId: string,
    };

    // Represents the filter for transactions
    export type TransactionFilter = {
        month?: string; // Filter by month (optional)
        year?: number; // Filter by year (optional)
    };

    export type User = {
        encerrouEm: any;
        id: string;
        name: string;
    };