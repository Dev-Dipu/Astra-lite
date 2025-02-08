import React, { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Partials/Header";
import { UserContext } from "../context/Context";
import axios from "../utility/axios";
import { storage } from "../utility/helperFunctions";

const User = () => {
    const { user, setUser } = useContext(UserContext);

    useEffect(() => {
        const accessToken = storage.get('accessToken');
        axios
          .get(`/users/profile`, {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            withCredentials: true,
          })
          .then(({ data }) => {
            setUser(data.data);
          })
          .catch((err) => {
            console.error('Failed to fetch user profile:', err);
          });
      }, []);

    return (
        user ? <div className="p-8">
        <Header avatar={user?.avatar} />
        <div className="mt-8">
            <Outlet />
        </div>
    </div> : <div>Loading...</div>
    );
};

export default User;
