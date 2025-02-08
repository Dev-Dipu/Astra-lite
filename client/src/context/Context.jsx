import { createContext, useState, useEffect } from "react";
import axios from "../utility/axios";
import { storage } from "../utility/helperFunctions";

export const UserContext = createContext();

const Data = (props) => {
  const [user, setUser] = useState(null)
  useEffect(() => {
    const accessToken = storage.get('accessToken');
    axios
      .get(`/users/check-auth`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, // Include token if available
        withCredentials: true, // Include session cookies for Google Auth
      })
      .then(({ data }) => {
        // console.log('User authenticated:', data.user);
        setUser(data.user);
      })
      .catch((err) => {
        console.error('Auth check failed:', err);
        window.location.href = "/"; // Redirect to login if not authenticated
      });
  }, []);

  return <UserContext.Provider value={{user, setUser}}>{props.children}</UserContext.Provider>;
}

export default Data