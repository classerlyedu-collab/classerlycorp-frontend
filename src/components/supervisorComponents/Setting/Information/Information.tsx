import { useEffect, useState } from "react";
import { CustomInput } from "../../../customInput";
import { DropDown } from "../../../customDropdown";
import { Get, Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { MultiDropDown } from "../../../multiselectDropdown";
import { useNavigate } from "react-router-dom";
import { UseStateContext } from "../../../../context/ContextProvider";

const Information = () => {
  const navigate = useNavigate();

  const {
    setHasChanges,
    isModalOpen,
    setIsModalOpen,
    hasChanges,
    updateUser
  } = UseStateContext();

  const avatarsArray = [
    'https://i.ibb.co/BfcNQ6Q/avatar1.png',
    'https://i.ibb.co/513Q6K6/avatar5.png',
    'https://i.ibb.co/80XP2t4/avatar4.png',
    'https://i.ibb.co/6Z0Rskw/avatar3.png',
    'https://i.ibb.co/F8XNjdS/avatar2.png',
  ];

  // data states
  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {} as any;
    }
  };
  let user = getStoredUser();
  const [userName, setUserName] = useState<string>(user?.userName);
  const [surname, setSurname] = useState<string>("");
  const [email, setEmail] = useState<string>(user?.email);
  const [grade, setGrade] = useState<any>("");
  const [gradet, setGradet] = useState<any>(
    []
  );

  const [profileImage, setProfileImage] = useState(user?.image);
  const [profileimagechange, setprofileimagechange] = useState(false);
  const [image, setimage] = useState(user?.image);
  const [imageMetadata, setImageMetadata] = useState(user?.imageMetadata);
  const [isUploading, setIsUploading] = useState(false);

  // error states
  const [userNameError, setUserNameError] = useState<string>("");
  const [surnameError, setSurnameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  // const [gradeData, setGradeData] = useState([]);

  const checkForChanges = () => {
    try {
      // Helper function to compare two arrays (order-sensitive)
      const arraysMatch = (arr1: any, arr2: any) => {
        if (!arr1 || !arr2) return false;
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
          if (arr1[i] !== arr2[i]) {
            return false;
          }
        }
        return true;
      };

      // Check if there are actual changes
      const hasUserNameChanged = userName !== user?.userName;
      const hasGradeChanged = user?.userType === 'Student' && grade !== user?.profile?.grade?._id;
      const hasImageChanged = profileImage !== user?.image;
      const hasTeacherGradesChanged = user?.userType === 'Teacher' && !arraysMatch(gradet, user?.profile?.grade?.map((i: any) => i._id) ?? []);
      const hasEmailChanged = email !== user?.email;

      const hasAnyChanges = hasUserNameChanged || hasGradeChanged || hasImageChanged || hasTeacherGradesChanged || hasEmailChanged;

      setHasChanges(hasAnyChanges);
      return hasAnyChanges;
    } catch (error) {
      setHasChanges(false);
      return false;
    }
  };

  useEffect(() => {
    checkForChanges();
  }, [email, userName, grade, profileImage, gradet]);

  const handleDiscardClick = () => {
    try {
      setUserName(user?.userName);
      setProfileImage(user?.image);
      setGrade(user?.profile?.grade?._id);
      setGradet(user?.profile?.grade?.map((i: any) => {
        return i._id;
      }));
      setHasChanges(false);
      setIsModalOpen(false);
    } catch (error) {

      setHasChanges(false);
      setIsModalOpen(false);
    }
  };

  const handleSaveClick = () => {
    try {
      handleUpdateClick();
      setHasChanges(false);
      setIsModalOpen(false);
    } catch (error) {
      setHasChanges(false);
      setIsModalOpen(false);

    }
  }

  const handleUploadClick = () => {
    if (isUploading) {
      displayMessage("Please wait, image is being uploaded...", "info");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file: any = target.files?.[0];
      if (file) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          displayMessage("File size must be less than 5MB", "error");
          return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          displayMessage("Please select a valid image file (JPEG, PNG, GIF, WEBP)", "error");
          return;
        }

        setIsUploading(true);
        displayMessage("Uploading image...", "info");

        const reader = new FileReader();
        reader.onloadend = () => {
          let data = new FormData();
          data.append("file", file);

          Post("/uploadimage", data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
            .then((d) => {
              console.log('Upload response:', d);
              if (d.success) {
                // Update local state immediately for preview
                setimage(d.file);
                setImageMetadata({
                  url: d.file,
                  publicId: d.public_id,
                  filename: d.filename,
                  uploadedAt: d.uploadedAt
                });
                setprofileimagechange(true);
                setProfileImage(reader.result as any);

                // Save to database immediately
                const updateData = {
                  image: d.file,
                  imageMetadata: {
                    url: d.file,
                    publicId: d.public_id,
                    filename: d.filename,
                    uploadedAt: d.uploadedAt
                  }
                };

                Post("/auth/updateuser", updateData).then((res) => {
                  if (res.success) {
                    // Update user data in context and localStorage
                    updateUser(res.data.data);
                    displayMessage("Profile image updated successfully", "success");
                  } else {
                    displayMessage("Image uploaded but failed to save. Please try again.", "error");
                  }
                  setIsUploading(false);
                }).catch((error) => {
                  console.error('Immediate save error:', error);
                  displayMessage("Image uploaded but failed to save. Please try again.", "error");
                  setIsUploading(false);
                });

              } else {
                displayMessage(d.message || "Upload failed", "error");
                setIsUploading(false);
              }
            })
            .catch((error) => {
              console.error("Upload error:", error);
              displayMessage(error.message || "Upload failed. Please try again.", "error");
              setIsUploading(false);
            });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleDeleteClick = () => {
    setprofileimagechange(true);
    setProfileImage("");

  };

  const handleUpdateClick = () => {
    let reqbody: any = {};
    if (email != user?.email) {
      reqbody.email = email;
    }
    if (userName != user?.userName) {
      reqbody.userName = userName;
    }
    if (user?.userType == "Teacher") {
      reqbody.grade = gradet;
    } else {
      reqbody.grade = grade;
    }

    // Only include image data if there are changes and it's not already saved
    if (profileimagechange) {
      if (profileImage == null || profileImage == "") {
        reqbody.image = "";
        reqbody.imageMetadata = null;
      } else {
        reqbody.image = image;
        reqbody.imageMetadata = imageMetadata;
      }
    }

    // Only proceed if there are changes to save
    if (Object.keys(reqbody).length === 0) {
      displayMessage("No changes to save", "info");
      return;
    }

    Post("/auth/updateuser", reqbody).then((res) => {
      if (res.success) {
        localStorage.setItem("token", res.data.token);
        delete res.data.token;

        // Update user data in context and localStorage
        updateUser(res.data.data);

        // Update local state to reflect changes immediately
        if (res.data.data.image) {
          setProfileImage(res.data.data.image);
          setimage(res.data.data.image);
        }
        if (res.data.data.imageMetadata) {
          setImageMetadata(res.data.data.imageMetadata);
        }

        // Reset the change flag
        setprofileimagechange(false);
        displayMessage("Profile updated successfully", "success");
      } else {
        displayMessage(res.message || "Update failed", "error");
      }
    }).catch((error) => {
      console.error('Update user error:', error);
      displayMessage(error.message || "Update failed", "error");
    });
  };

  useEffect(() => {

    if (user?.userType === "HR-Admin") {
      // For teachers, grade is an array of ObjectIds (not populated)
      if (user?.profile?.grade && Array.isArray(user?.profile?.grade)) {
        // Check if it's populated grade objects or just ObjectIds
        if (user?.profile?.grade[0] && typeof user?.profile?.grade[0] === 'object' && user?.profile?.grade[0]._id) {
          // It's populated grade objects
          setGradet(user?.profile?.grade?.map((i: any) => {
            return i._id;
          }))
        } else {
          // It's ObjectIds, use them directly
          setGradet(user?.profile?.grade || [])
        }
      } else {
        setGradet([])
      }
    } else {
      setGrade(user?.profile?.grade?._id)
    }

    // Removed grade API usage in corporate model
    if (gradet?.join(",") == undefined) {
      navigate("/")
    }
    // if(user?.userType=="Teacher"){

    //   Get(`/subject/grade/${user?.profile?.grade?.map((i: any) => {
    //     return i._id;
    //   })?.join(",")}`)
    //     .then((d) => {
    //       if (d.success) {
    //         setCourseData(d.data);
    //       } else {
    //         displayMessage(d.message);
    //       }
    //     })
    //     .catch((e) => {
    //       displayMessage(e.message);
    //     });
    // }else{


    //   Get(`/subject/grade/${user?.profile?.grade?._id}`)
    //     .then((d) => {
    //       if (d.success) {
    //         setCourseData(d.data);
    //       } else {
    //         displayMessage(d.message);
    //       }
    //     })
    //     .catch((e) => {
    //       displayMessage(e.message);
    //     });
    // }
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Profile Settings</h1>
          <p className="text-sm sm:text-base md:text-lg text-white/90 mt-2 max-w-2xl">
            Manage your profile information and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 mb-12 sm:mb-16">
        <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm">
          {/* Profile Picture Section */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Profile Picture</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Update your profile picture</p>
            </div>
            <button
              onClick={handleUpdateClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {user.userType === "Student" ? (
              <div className="space-y-6">
                {/* Current Avatar */}
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Current Avatar</h3>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 border-4 border-white shadow-lg">
                    <img
                      src={profileImage ?? avatarsArray[0]}
                      className="w-16 h-16 rounded-full object-cover"
                      alt="Current Avatar"
                    />
                  </div>
                </div>

                {/* Avatar Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Choose Your New Avatar</h3>
                  <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                    {avatarsArray?.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setProfileImage(item);
                          setimage(item);
                          setprofileimagechange(true);
                        }}
                        className={`w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${profileImage === item
                          ? 'border-indigo-500 ring-2 ring-indigo-200'
                          : 'border-gray-200 hover:border-indigo-300'
                          }`}
                      >
                        <img
                          src={item}
                          className="w-full h-full rounded-full object-cover"
                          alt={`Avatar ${index + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={
                        profileImage || user?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"
                      }
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      alt="Profile"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a new profile picture. JPG, PNG, GIF or WEBP. Max size 5MB.
                  </p>
                  <button
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isUploading
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md'
                      }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload New Photo
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm mt-6">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Personal Information</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Update your personal details</p>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <CustomInput
                value={userName}
                setValue={setUserName}
                placeholder="e.g maryjackson123"
                error={userNameError}
                setError={setUserNameError}
                style={{
                  wrapper: "mb-0",
                  input: "pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm",
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <CustomInput
                value={email}
                type="email"
                setValue={setEmail}
                placeholder="e.g user@gmail.com"
                error={emailError}
                setError={setEmailError}
                style={{
                  wrapper: "mb-0",
                  input: "pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm",
                }}
              />
            </div>
          </div>

          {/* Employee/Student Code */}
          {(user.userType === "Student" || user.userType === "Employee") && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {user.userType === "Student" ? "Student Code" : "Employee Code"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl bg-gray-50 text-sm text-gray-600">
                  {user?.profile?.code || "Not assigned"}
                </div>
              </div>
            </div>
          )}

          {/* Grade selection removed in corporate model */}
        </div>
      </div>


      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
              <p className="text-sm text-gray-600 mt-1">You have unsaved changes. What would you like to do?</p>
            </div>
            <div className="px-6 py-4 space-y-3">
              <button
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                onClick={() => handleSaveClick()}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
              <button
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                onClick={() => handleDiscardClick()}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Information;

