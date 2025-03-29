// types.ts
export interface Company {
  company_name: string;
  is_past: boolean;
  is_current: boolean;
}

export interface Geography {
  geography_id: number;
  country: string;
  city: string;
  timezone: string;
}

// export interface ProjectFormData {
//   projectName: string;
//   status: boolean;
//   startDate: string;
//   endDate: string;
//   expectedCalls: number;
//   clientRequirements: string[];
//   screeningQuestions: string[];
//   file: File | null;
//   geographyId: string;
//   companiesOfInterest: Company[];
// }

// export interface ProjectFormData {
//   projectName: string;
//   status: boolean;
//   startDate: string;
//   endDate: string;
//   expectedCalls: number;
//   clientRequirements: string[];
//   screeningQuestions: string[];
//   file: File | null;
//   geographyId: string;
//   companiesOfInterest: any[];
//   clientTeams: any[];
//   clientCompanies: any[];
// }

// /types/projects.ts
export interface ProjectFormData {
  projectName: string;
  status: boolean;
  startDate: string;
  endDate: string;
  expectedCalls: string;
  clientRequirements: string[];
  screeningQuestions: string[];
  file: File | null;
  geographyId: string;
  companiesOfInterest: Array<{
    company_name: string;
    is_current?: boolean;
    is_past?: boolean;
    company_of_interest_id?: number | null;
  }>;
  // New fields for client details
  clientCompanies?: Array<{
    company_name: string;
    client_company_id?: number | null;
    project_id?: number | string;
    isNew?: boolean;
  }>;
  clientTeams?: Array<{
    project_id?: number | string;
    client_member_id?: number | null;
    project_client_team_id?: number | null;
    member?: {
      client_name: string;
      client_email: string;
      phone_number: string;
      client_company_id?: number | string | null;
      client_member_id?: number | null;
    };
  }>;
}