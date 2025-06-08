import React from "react";

// @material-tailwind/react
import {
  Button,
  Typography,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Card,
  CardBody,
} from "@material-tailwind/react";

import { User, ChevronDown, ChevronUp } from "lucide-react";

export function KpiCard({
  title,
  total,
  icon,
}) {
  return (
    <Card className="bg-white shadow-sm border border-gray-200 !rounded-lg">
      <CardBody className="p-4">
        <div className="flex justify-between items-center">
            <div>
                <Typography
                    className="!font-medium !text-xs text-gray-600"
                >
                {title}
                </Typography>
                <Typography
                    color="blue-gray"
                    className="mt-1 font-bold text-2xl"
                    >
                    {total}
                </Typography>
            </div>
          
          <div className="flex items-center gap-1">
            <div className="bg-gradient-to-br from-green-300 to-teal-400 p-2 rounded-xl">
                {icon}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

const data = [
  {
    title: "Total patients",
    total: "123",
    icon: (
      <User
        className="w-10 h-10 text-white"
      />
    ),
  },
  {
    title: "exampleKPI",
    total: "value",
    icon: (
      <ChevronUp
        className="w-10 h-10 text-white"
      />
    ),
  },
  {
    title: "exampleKPI2",
    total: "19,720",
    icon: (
      <ChevronUp
        className="w-10 h-10 text-white"
      />
    ),
  },
  {
    title: "exampleKPI3",
    total: "20,000",
    icon: (
      <ChevronDown
        className="w-10 h-10 text-white"
      />
    ),
  },
];

function KPIMain() {
  return (
    <section className="container mx-auto ">
      {/* <div className="flex justify-between md:items-center">
        <div>
          <Typography className="font-bold">Overall Performance</Typography>
          <Typography
            variant="small"
            className="font-normal text-gray-600 md:w-full w-4/5"
          >
            Upward arrow indicating an increase in revenue compared to the
            previous period.
          </Typography>
        </div>
        <div className="shrink-0">
          <Menu>
            <MenuHandler>
              <Button
                color="gray"
                variant="outlined"
                className="flex items-center gap-1 !border-gray-300"
              >
                last 24h
                <ChevronDown
                  className="w-3 h-3 text-gray-900"
                />
              </Button>
            </MenuHandler>
            <MenuList>
              <MenuItem>last 12h</MenuItem>
              <MenuItem>last 10h</MenuItem>
              <MenuItem>last 24h</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div> */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 items-center md:gap-2.5 gap-4">
        {data.map((props, key) => (
          <KpiCard key={key} {...(props)} />
        ))}
      </div>
    </section>
  );
}

export default KPIMain;