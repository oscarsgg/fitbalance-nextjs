import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";

export default function NextAppointment() {
  return (
    <Card
      shadow={false}
      className="relative grid h-[15rem] w-full max-w-[28rem] items-end justify-center overflow-hidden text-center"
    >
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="absolute inset-0 m-0 h-full w-full rounded-none bg-[url('/nutriologo.jpg')] bg-cover bg-center"
      >
        <div className="to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50" />
      </CardHeader>
      <CardBody className="relative py-14 px-6 md:px-12">
        {/* Título */}
        <Typography
          variant="h2"
          color="white"
          className="mb-4 font-medium leading-[1.5] text-lg sm:text-xl md:text-2xl lg:text-3xl"
        >
          Next appointment
        </Typography>

        {/* Nombre */}
        <Typography
          variant="h5"
          className="mb-2 text-white text-base sm:text-md md:text-lg lg:text-xl"
        >
          Brian Sanchez
        </Typography>

        {/* Hora */}
        <Typography
          variant="h5"
          className="mb-2 text-white text-base sm:text-md md:text-lg lg:text-xl"
        >
          Today at 9:AM
        </Typography>
      </CardBody>
    </Card>
  );
}
