export const getAuthHeader = () => ({
    headers: {
      Authorization: sessionStorage.getItem("auth_token") || "",
    },
  });  