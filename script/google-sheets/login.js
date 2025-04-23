import { url } from "/script/config.js";

export const login = async (userUuid) => {
  const body = new URLSearchParams({
    action: "login",
    userUuid,
  });

  return fetch(`${url.googleSheets}`, { method: "POST", body })
    .then((res) => res.json())
    .then((response) => {
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "User not found");
      }
    })
    .catch(() => {
      throw new Error("Connection error");
    });
};
