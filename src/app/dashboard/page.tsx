
"use client";

import {
  Activity,
  ArrowUpRight,
  BookUser,
  CreditCard,
  DollarSign,
  FileCheck2,
  Menu,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts"
import { RoleIcon } from "@/components/role-icon";


const chartData = [
    { month: "Enero", desktop: 186, mobile: 80 },
    { month: "Febrero", desktop: 305, mobile: 200 },
    { month: "Marzo", desktop: 237, mobile: 120 },
    { month: "Abril", desktop: 73, mobile: 190 },
    { month: "Mayo", desktop: 209, mobile: 130 },
    { month: "Junio", desktop: 214, mobile: 140 },
]

const chartConfig = {
    desktop: {
      label: "1er Grado",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "2do Grado",
      color: "hsl(var(--chart-2))",
    },
}

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alumnos Evaluados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,234</div>
              <p className="text-xs text-muted-foreground">
                +20.1% desde el último examen
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Docentes Activos
              </CardTitle>
              <BookUser className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+873</div>
              <p className="text-xs text-muted-foreground">
                +180.1% este último mes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exámenes Cerrados</CardTitle>
              <FileCheck2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +1 desde la semana pasada
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cargas Pendientes
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                Docentes aún no finalizaron la carga
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Rendimiento Anual</CardTitle>
                <CardDescription>
                  Comparativa de promedios entre grados.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/analisis">
                  Ver Todo
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <LineChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            domain={[0, 400]}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                            dataKey="desktop"
                            type="monotone"
                            stroke="var(--color-desktop)"
                            strokeWidth={2}
                            dot={false}
                            />
                        <Line
                            dataKey="mobile"
                            type="monotone"
                            stroke="var(--color-mobile)"
                            strokeWidth={2}
                            dot={false}
                            />
                    </LineChart>
                </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cargas Recientes</CardTitle>
              <CardDescription>
                Docentes que finalizaron la carga de notas recientemente.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
            <div className=" flex items-center gap-4">
                <div className="hidden h-9 w-9 sm:flex items-center justify-center">
                    <RoleIcon role="Docente" />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Olivia Martin
                  </p>
                  <p className="text-sm text-muted-foreground">
                    olivia.martin@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">Esc. N° 789</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden h-9 w-9 sm:flex items-center justify-center">
                    <RoleIcon role="Director" />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Jackson Lee</p>
                  <p className="text-sm text-muted-foreground">
                    jackson.lee@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">Esc. N° 101</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden h-9 w-9 sm:flex items-center justify-center">
                    <RoleIcon role="Docente" />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Isabella Nguyen
                  </p>
                  <p className="text-sm text-muted-foreground">
                    isabella.nguyen@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">Esc. N° 456</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
