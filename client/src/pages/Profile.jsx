import { useState, useEffect, useCallback } from "react";
import axios from "../utility/axios";
import { debounce, storage } from "../utility/helperFunctions";
import { BiLogOut, BiPencil } from "react-icons/bi";
import { FaArrowLeft, FaMedal, FaUser } from "react-icons/fa";
import { IoAnalyticsSharp } from "react-icons/io5";
import AvatarMenu from "../components/Partials/AvatarMenu";
import { useNavigate } from "react-router-dom";

const Profile = () => {

  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: "",
    fullname: "",
    email: "",
    avatar: "",
  });
  const [checkUniqueStatus, setCheckUniqueStatus] = useState({ username: "" });

  useEffect(() => {
    // Fetch user data
    axios.get("/users/profile")
      .then(response => setUser(response.data.data))
      .catch(error => console.error("Failed to fetch user data", error));
  }, []);

  const handleChange = (field, value) => {
    const updatedUser = { ...user, [field]: value };
    setUser(updatedUser);
  };

  const debounceSave = useCallback(
    debounce((updatedUser) => {
      axios.put("/users/profile", updatedUser)
        .then(response => {
          console.log("User data updated", response.data);
          setUser(response.data.data); // Update state with response data
          setCheckUniqueStatus({ username: "" }); // Clear the availability status
        })
        .catch(error => console.error("Failed to update user data", error));
    }, 2000),
    []
  );

  const checkUniqueAndSave = useCallback(
    debounce((field, value) => {
      if (field === "username") {
        axios.get(`/services/checkunique/${field}/${value}`)
          .then(response => {
            console.log(response.data.data)
            if (response.data.data) {
              setCheckUniqueStatus(prevState => ({ ...prevState, [field]: "Available" }));
              const updatedUser = { ...user, [field]: value };
              debounceSave(updatedUser);
            } else {
              setCheckUniqueStatus(prevState => ({ ...prevState, [field]: "Taken" }));
            }
          })
          .catch(error => console.error("Failed to check uniqueness", error));
      } else {
        const updatedUser = { ...user, [field]: value };
        debounceSave(updatedUser);
      }
    }, 500),
    [user, debounceSave]
  );

  const handleUniqueChange = (field, value) => {
    handleChange(field, value);
    checkUniqueAndSave(field, value);
  };

  const handleLogout = () => {
    axios.post("/users/logout").then(() => {
      storage.remove("accessToken");
      window.location.href = "/";
    });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("username", user.username);
    formData.append("fullname", user.fullname);
    formData.append("email", user.email);

    axios.put("/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(response => {
        setUser(response.data.data);
      })
      .catch(error => {
        console.error("Failed to update avatar", error);
      });
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-8">
      <div className="flex items-center justify-between px-4 py-2">
      <FaArrowLeft className="text-xl cursor-pointer leading-none" onClick={()=> navigate(-1)}/>
      <AvatarMenu />
      </div>
      <div className="flex items-center gap-4">
        {/* Sidebar */}
        <div className="w-1/5 p-6 space-y-8 self-start">
        <h1 className="text-3xl font-light">Account Center</h1>
          <nav className="space-y-4 ml-3">
            <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
              <FaUser className="w-5 h-5" />
              Personal Details
            </a>
            <a href="#" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
              <IoAnalyticsSharp className="w-5 h-5" />
              Analytics
            </a>
          </nav>
        </div>
        <main className="flex-1 p-6">
          <div className="max-w-xl my-20 mx-16 space-y-8">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-[5px] bg-gray-600 flex items-center justify-center overflow-hidden">
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleAvatarChange}
                />
                <button className="absolute -right-2.5 -top-2.5 w-8 h-8 bg-[#27E0B3] rounded-full flex items-center justify-center 
                    shadow-[0_0_25px_1px_#27E0B3]">
  <BiPencil className="w-4 h-4 text-white" />
</button>

              </div>
              <div>
                <h2 className="text-2xl font-semibold">
                  {user.username} <FaMedal className="inline-block ml-1 text-xl text-[#d66b4b] drop-shadow-[0_0_10px_rgba(112,70,62,0.9)]" />



                </h2>
                <p className="text-white/60">{user.email}</p>
              </div>
            </div>

            {/* Form */}
            <div className="grid gap-6">
              <div className="grid gap-2">
                <label className="text-sm text-white/60">Username</label>
                <input
                  type="text"
                  spellCheck={false}
                  value={user.username}
                  onChange={(e) => handleUniqueChange("username", e.target.value)}
                  className="px-3 py-2 mt-2 bg-[#1e1f26] rounded-[5px] text-white outline-none text-xl"
                />
                {checkUniqueStatus.username && (
                  <span className={`text-sm ${checkUniqueStatus.username === "Available" ? "text-green-500" : "text-red-500"}`}>
                    {checkUniqueStatus.username}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-white/60">Full Name</label>
                <input
                  type="text"
                  value={user.fullname}
                  spellCheck={false}
                  onChange={(e) => handleChange("fullname", e.target.value)}
                  onBlur={(e) => debounceSave({ ...user, fullname: e.target.value })}
                  className="px-3 py-2 mt-2 bg-[#1e1f26] rounded-[5px] text-white outline-none text-xl"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-white/60">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="px-3 py-2 mt-2 bg-[#1e1f26] rounded-[5px] text-white outline-none text-xl cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="fixed bottom-12 right-12">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-[5px] flex items-center gap-2"
            >
              <BiLogOut />
              Logout
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;