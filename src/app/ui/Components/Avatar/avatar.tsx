import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/app/firebase";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { MdOutlineDarkMode } from "react-icons/md";
import { PiSunDimDuotone } from "react-icons/pi";
import Square from "../../../../../public/images/avatar/form-avatar.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CircleUserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AvatarProps = {
  isCollapsed: boolean;
};

export default function Avatar({ isCollapsed }: AvatarProps) {
  const { data: session } = useSession();
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isChecked, setIsChecked] = useState(true);
  const router = useRouter();
  const userRole = session?.user.role;

  useEffect(() => {
    if (session) {
      const { user } = session;
      setName(user.name || "");

      if (user.role) {
        setRole(user.role);
      }

      // Fetch profile picture URL from Firebase Storage
      const profilePictureRef = ref(storage, `profilePictures/${user.id}`);
      getDownloadURL(profilePictureRef)
        .then((url) => setProfilePictureURL(url))
        .catch(() => setProfilePictureURL(null));
    }
  }, [session]);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem("isDarkMode");
    setIsChecked(storedDarkMode === "true");
  }, []);

  const handleCheckboxChange = () => {
    setIsChecked((prevChecked) => {
      const newChecked = !prevChecked;
      localStorage.setItem("isDarkMode", newChecked.toString());
      document.body.classList.toggle("dark", newChecked);
      return newChecked;
    });
  };

  function handleLogout() {
    signOut({ callbackUrl: "/signin" });
  }

  const handleAvatarClick = () => {
    if (userRole === "teacher") {
      router.push("/teacher-dashboard/perfil");
    } else if (userRole === "student") {
      router.push("/student-dashboard/perfil");
    } else if (userRole === "admin") {
      router.push("/admin-dashboard/perfil");
    } else {
      router.push("perfil");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={handleAvatarClick}
            className="justify-center items-center"
          >
            {profilePictureURL ? (
              <motion.div 
                className="cursor-pointer relative inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.img
                  src={profilePictureURL}
                  className="object-cover w-12 h-12 rounded-full"
                  alt="Profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span 
                  className="absolute top-0 right-0 w-4 h-4 bg-fluency-green-700 border-2 border-white rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                />
              </motion.div>
            ) : (
              <motion.div 
                className="bg-fluency-gray-100 dark:bg-fluency-gray-800 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer mx-auto"
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <CircleUserRound 
                  strokeWidth={0.75} 
                  className="icon w-12 h-12 rounded-full" 
                />
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
            className="bg-fluency-gray-200 dark:bg-fluency-gray-800 transition-all ease-in-out duration-300 cursor-pointer font-semibold text-fluency-text-light dark:text-fluency-text-dark w-[13.7rem] rounded-xl flex flex-col items-start justify-between overflow-visible relative shadow-lg"
          >
            <motion.div
              variants={itemVariants}
              onClick={handleAvatarClick}
              className="w-[4.4rem] h-[4.4rem] rounded-full bg-fluency-bg-light shadow-md dark:bg-fluency-pages-dark items-center justify-center flex relative bottom-4 left-3"
            >
              {profilePictureURL ? (
                <div className="cursor-pointer relative inline-block">
                  <motion.img
                    src={profilePictureURL}
                    className="object-cover min-w-[4.4rem] max-w-[4.4rem] h-[4.4rem] rounded-full"
                    alt="Profile"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span 
                    className="absolute bottom-0 right-0 w-4 h-4 bg-fluency-green-700 border-2 border-white rounded-full"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <CircleUserRound 
                    strokeWidth={0.75} 
                    className="icon w-20 h-20 rounded-full" 
                  />
                </motion.div>
              )}
            </motion.div>
            
            <motion.div 
              className="flex flex-col items-start relative bottom-3 left-3"
              variants={itemVariants}
            >
              <motion.p 
                className="text-lg font-bold z-10"
                variants={itemVariants}
              >
                {name}
              </motion.p>
              <motion.p 
                className="text-xs relative bottom-2"
                variants={itemVariants}
              >
                {role === "admin"
                  ? "Coordenador"
                  : role === "student"
                  ? "Aluno"
                  : role === "teacher"
                  ? "Professor"
                  : role?.charAt(0).toUpperCase() + role?.slice(1)}
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="flex flex-row gap-1 absolute top-2 right-3"
              variants={itemVariants}
            >
              <motion.div 
                className="bg-fluency-bg-light dark:bg-fluency-pages-dark rounded-lg items-center justify-center flex p-2"
                whileHover={{ scale: 1.1, rotate: 20 }}
                whileTap={{ scale: 0.9 }}
              >
                {isChecked ? (
                  <MdOutlineDarkMode
                    onClick={handleCheckboxChange}
                    className="w-4 h-4 text-purple-500 hover:text-purple-600 duration-300 ease-in-out transition-all"
                  />
                ) : (
                  <PiSunDimDuotone
                    onClick={handleCheckboxChange}
                    className="w-4 h-4 text-orange-500 hover:text-orange-600 duration-300 ease-in-out transition-all"
                  />
                )}
              </motion.div>
              <motion.div 
                className="bg-fluency-bg-light dark:bg-fluency-pages-dark rounded-lg items-center justify-center flex p-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiLogOut
                  onClick={handleLogout}
                  className="w-4 h-4 text-fluency-red-500 hover:text-fluency-red-600 duration-300 ease-in-out transition-all"
                />
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute bottom-1 right-8"
            >
              <Image
                className="w-14"
                src={Square}
                alt="Profile"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}