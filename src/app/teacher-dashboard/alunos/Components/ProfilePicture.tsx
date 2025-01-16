import { FaUserCircle } from "react-icons/fa";
import clsx from "clsx";

interface ProfilePictureProps {
  profilePicUrl?: string | null;
  status: any;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ profilePicUrl, status }) => {
  return (
    <div className="cursor-pointer relative inline-block">
      {profilePicUrl ? (
        <img
          src={profilePicUrl || "../../../../../public/images/avatar/default-profile-pic.jpg"}
          alt="Profile"
          className="w-[6rem] h-[6rem] object-cover rounded-full"
          loading="lazy"
        />
      ) : (
        <FaUserCircle className="w-[6rem] h-[6rem] text-[5rem] text-fluency-gray-200 dark:text-fluency-pages-dark object-cover rounded-full" />
      )}
      <div
        className={clsx(
          "absolute top-0 right-2 w-4 h-4 border-2 border-white bg-black dark:bg-gray-200 rounded-full",
          {
            "bg-fluency-green-700 dark:bg-fluency-green-700": status === "online",
            "bg-fluency-red-700 dark:bg-fluency-red-700": status === "offline",
          }
        )}
      />
    </div>
  );
};

export default ProfilePicture;
