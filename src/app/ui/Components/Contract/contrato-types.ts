export interface Aluno {
  // Existing properties
  id: string;
  name: string;
  email: string;

  // --- Added properties based on your component's usage ---
  nacionalidade?: string;      // From {NACIONALIDADE_ALUNO}
  estadoCivil?: string;        // From {ESTADO_CIVIL_ALUNO}
  profissao?: string;          // From {PROFISSAO_ALUNO}
  cpf?: string;                // From {CPF_ALUNO}
  rg?: string;                 // From {RG_ALUNO}
  address?: string;            // From {ENDERECO_ALUNO}
  city?: string;               // From {CIDADE_ALUNO}
  state?: string;              // From {ESTADO_ALUNO}
  zipCode?: string;            // From {CEP_ALUNO}
  level?: string;              // From {NIVEL_CURSO}
  diaVencimento?: string;      // From {DIA_VENCIMENTO}
  ContratosAssinados?: {         // From userData.ContratoAssinado
      signed: boolean;
      signedByAdmin: boolean;
      logId?: string;
      signedAt?: string;
      adminSignedAt?: string;
  };
}
export interface ContractLog {
    cpf: string;
    name: string;
    birthDate: string; // YYYY-MM-DD format from input type="date"
    ip: string;
    viewedAt: string; // ISO String Date
    signedAt: string; // ISO String Date
    agreedToTerms: boolean;
    browser: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    logID?: string; // Firestore document ID

    // Admin signature fields
    segundaParteAssinou?: boolean;
    SecondCPF?: string;
    SecondBirthDate?: string;
    SecondIP?: string;
    SecondBrowser?: string;
    SecondNome?: string;
    adminSignedAt?: string; // ISO String Date for admin signature
}

// Represents the status stored in the main user document (e.g., users/{userId}.ContratoAssinado)
export interface ContractStatus {
    signed: boolean; // Student signed
    signedByAdmin: boolean; // School/Admin signed
    logId?: any; // Reference to the specific log document in the subcollection
    signedAt?: any; // ISO String Date of student signature
    adminSignedAt?: any; // ISO String Date of admin signature
}

// Used in the admin page to combine Aluno data with contract status
export interface StudentWithContractStatus extends Aluno {
    contractStatus?: ContractStatus;
    isSigning?: boolean; // UI state for loading indicator during admin sign
}

// Structure expected by the SignatureModal's onSubmit prop
export interface SignatureFormData {
    cpf: string;
    name: string;
    birthDate: string;
    ip: string;
    browser: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
}
