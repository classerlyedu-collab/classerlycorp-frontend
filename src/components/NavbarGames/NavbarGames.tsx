import { MdArrowBack, MdCancel } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../routes/RouteNames";

interface NavBarProps {
    title: string,
    route: string,
};

const NavbarGames = ({
    title,
    route
}: NavBarProps) => {

    const navigate = useNavigate();

    return (
        <div className="flex flex-row items-center h-10 mb-4 justify-between w-full bg-[#000000`]  flex-wrap" >


            {
                route === RouteName?.DAILY_QUIZ_ROOT
                    ?
                    <MdCancel
                        className="text-white mr-1 md:mr-2 text-xl md:text-2xl cursor-pointer"
                        onClick={() => navigate(route)}
                    />
                    :
                    <MdArrowBack
                        className="text-white mr-1 md:mr-2 text-xl md:text-2xl cursor-pointer"
                        onClick={() => navigate(route)}
                    />
            }
            <h1 className="font-ubuntu font-medium text-base md:text-xl text-white">{title}</h1>
            <h1 className="sm:hidden md:flex font-ubuntu font-medium text-base md:text-xl text-[#000000]">Games</h1>

        </div>
    )
};

export default NavbarGames;