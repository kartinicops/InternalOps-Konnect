export interface CompanyOfInterest {
company_of_interest_id: number;
project_id: number;
company_name: string;
is_past: boolean;
is_current: boolean;
}

export interface ClientCompany {
client_company_id: number;
company_name: string;
}

export interface ClientTeam {
client_team_id: number;
client_member_id: number;
project_id: number;
}

export interface ClientMember {
client_member_id: number;
client_company_id: number;
client_name: string;
client_email: string;
phone_number: string;
}

export interface ProjectFile {
file_id: number;
file_name: string;
file_path: string;
file_type: string;
uploaded_at: string;
project_id: number;
file_url: string;
}

export interface Geography {
geography_id: number;
country: string;
city: string;
timezone: string;
}

export interface Project {
project_id: number;
project_name: string;
status: boolean;
timeline_start: string;
timeline_end: string;
expected_calls: number;
completed_calls: number;
client_requirements: string;
created_at: string;
geography_id: number;
geography: Geography;
screening_questions: string;
files: ProjectFile[];
companies_of_interest?: CompanyOfInterest[];
client_companies?: ClientCompany[];
client_teams?: ClientTeam[];
client_members?: ClientMember[];
}