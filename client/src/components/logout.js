import * as React from "react";


export const LogoutComponent = (props)=> {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("token");
  props.history.push("/logout");
  window.location.href = "/logout"
  return <p>You are successfully logged off!</p>
}

