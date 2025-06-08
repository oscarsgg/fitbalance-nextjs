import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
 
export default function HorizontalCard() {
  return (
    <Card className="bg-white border border-gray-200 h-[15rem] w-full max-w-[48rem] flex-row">
      <CardHeader
        shadow={false}
        floated={false}
        className="m-0 w-2/5 shrink-0 rounded-r-none"
      >
        <img
          src="/tech-logo.jpg"
          alt="card-image"
          className="h-full w-full object-cover"
        />
      </CardHeader>
      <CardBody>
        <Typography
            variant="h6"
            color="gray"
            className="mb-2 uppercase text-sm md:text-base"
        >
            Dashboard
        </Typography>

        <Typography
            variant="h4"
            color="blue-gray"
            className="mb-2 text-base md:text-lg lg:text-xl"
        >
            Welcome back, Dr. Leon Ramirez de la Peña
        </Typography>

        {/* <Typography
            color="gray"
            className="mb-2 font-normal text-sm md:text-base"
        >
            Like so many organizations these days, Autodesk is a com
        </Typography> */}


        <a href="#" className="inline-block">
          <Button variant="text" className="flex items-center gap-2">
            Learn More
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </Button>
        </a>
      </CardBody>
    </Card>
  );
}