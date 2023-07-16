import TropicalLeavesIcon from "../../public/tropical-leaves.webp";
import Image from "next/image";
import classNames from "classnames";
import Link from "next/link";

interface NavbarPropTypes {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarPropTypes) {
  return (
    <div className={classNames("navbar bg-base-100", className)}>
      <div className="flex-1">
        <Link href={"/"} className="btn-ghost btn text-2xl normal-case">
          <Image
            src={TropicalLeavesIcon}
            alt="Leaves icon"
            width={28}
            height={28}
          />
          Leaves
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href={"/"}>Dashboard</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
