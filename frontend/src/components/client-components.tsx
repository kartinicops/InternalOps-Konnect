// client-components.tsx
import React, { ReactNode } from 'react';
import { Building, Tag, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Interface definitions
interface ClientSectionProps {
  title: string;
  icon: ReactNode;
  items: any[] | undefined;
  renderItem: (item: any) => React.ReactNode;
  emptyMessage: string;
}

// Reusable client section component with cleaner design
export const ClientSection = ({ 
  title, 
  icon, 
  items, 
  renderItem, 
  emptyMessage 
}: ClientSectionProps): JSX.Element => (
  <div className="mb-4">
    <div className="flex items-center mb-2">
      {icon}
      <h3 className="text-md font-semibold text-gray-700">{title}</h3>
    </div>
    {items && items.length > 0 ? (
      <div className="space-y-2">
        {items.map(renderItem)}
      </div>
    ) : (
      <div className="text-gray-500 text-sm">{emptyMessage}</div>
    )}
  </div>
);

// Types for data models
export interface CompanyOfInterest {
  company_of_interest_id: number;
  project_id: number;
  company_name: string;
  is_current: boolean;
}

export interface ClientCompany {
  client_company_id: number;
  company_name: string;
}

export interface ClientMember {
  client_member_id: number;
  client_name: string;
  client_email: string;
  phone_number?: string;
}

export interface ClientTeam {
  project_id: number;
  client_member_id: number;
}