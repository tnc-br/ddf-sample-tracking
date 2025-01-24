import React from "react";
import { MdHelpOutline } from "react-icons/md";

import HoverIcon from "../HoverIcon";

type Props = {
  text?: string;
  children?: React.ReactNode;
};

const InfoDummy = ({ text, children }: Props) => {
  return (
    <HoverIcon
      icon={() => (
        <MdHelpOutline className="inline-block [&_*]:!text-neutral-400 w-4 h-4" />
      )}
    >
      {text && (
        <p className="flex flex-col gap-4 text-neutral-50 text-xs">{text}</p>
      )}
      {children && children}
    </HoverIcon>
  );
};

export default InfoDummy;
