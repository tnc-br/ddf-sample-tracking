import { twMerge } from "tailwind-merge";

const LOADER_SIZES = {
  SM: "w-4 h-4 border-2",
  MD: "w-8 h-8 border-4",
  LG: "w-12 h-12 border-6",
};

const LOADER_COLORS = {
  PRIMARY: "border-blue-500",
  NEUTRAL_HIGH: "border-gray-700",
  ERROR: "border-red-500",
};

interface LoaderProps {
  size?: "SM" | "MD" | "LG";
  color?: "PRIMARY" | "NEUTRAL_HIGH" | "ERROR";
  className?: string;
}

const Loader = ({
  size = "MD",
  color = "NEUTRAL_HIGH",
  className,
}: LoaderProps) => {
  const sizeClass = LOADER_SIZES[size];
  const colorClass = LOADER_COLORS[color];

  const classes = twMerge(
    "inline-block box-border rounded-full border-solid animate-spin",
    sizeClass,
    colorClass,
    className
  );

  return (
    <span className={classes} style={{ borderBottomColor: "transparent" }} />
  );
};

export default Loader;
