export interface RegisterData {
    user_first_name: string
    user_last_name: string
    email: string
    password: string
    password_confirm: string
  }
  
  export interface RegisterResponse {
    user_id: number
    user_first_name: string
    user_last_name: string
    email: string
  }
  
  export interface APIError {
    detail?: string
    email?: string[]
    password?: string[]
    user_first_name?: string[]
    user_last_name?: string[]
  }
  