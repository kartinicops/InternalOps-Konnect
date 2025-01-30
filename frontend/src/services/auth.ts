export async function register(formData: any) {
    const response = await fetch("http://127.0.0.1:8000/api-auth/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
  
    return response.json();
  }
  
  
  export async function login(credentials: { email: string; password: string }) {
    const response = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
  
    const data = await response.json();
    localStorage.setItem("token", data.token); // Simpan token untuk sesi
    return data;
  }
  