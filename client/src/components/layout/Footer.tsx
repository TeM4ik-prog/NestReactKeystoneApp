import { RoutesConfig } from "@/types/pagesConfig";

import { FaGithub } from "react-icons/fa";
import { Button } from "../ui/Button";

export const Footer: React.FC = () => {
    return (
        <footer className="flex flex-col justify-center items-center gap-3 bg-gray-900 text-gray-100 p-4 mt-auto md:flex-row">
            <Button className="h-min" text='TeM4ik' icon={<FaGithub size={30} />} href="https://github.com/TeM4ik-prog" />
        </footer>
    );
};
