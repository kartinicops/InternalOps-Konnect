export interface ClientMember {
    client_member_id?: number;
    client_company_id?: number | null;
    client_name: string;
    client_email: string;
    phone_number: string;
  }
  
  export interface ClientTeam {
    client_team_id?: number;
    client_member_id?: number;
    project_id?: number;
  }
  
  export interface ClientCompany {
    client_company_id?: number;
    company_name: string;
  }