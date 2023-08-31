"use client"

import AdminHistoryTable from "../dashboard/AdminHistoryTable"
import { AdminHistoryState } from "@/app/admin/(admin)/page";
import AdminChartDevice from "../dashboard/AdminChartDevice";
import AdminChartHistory from "../dashboard/AdminChartHistory";

const DashboardContentAdmin = ({
  getAdminHistory, getAccessHistory, getAccessDevice
}: {
  getAdminHistory: (page?: number, per_page?: number) => Promise<{data: AdminHistoryState[], count: number}>
  getAccessHistory: (data?: Date) => Promise<{data: {count: number, date: string}[]}>
  getAccessDevice: () => Promise<{counts: any}>
}) => {

  return (
    <div className="py-4">
      <div className="flex flex-wrap -mx-4">
        <div className="w-full md:w-2/3 px-4 mb-8">
          <AdminChartHistory getAccessHistory={getAccessHistory} />
        </div>
        <div className="w-full md:w-1/3 px-4 mb-8">
          <AdminChartDevice getAccessDevice={getAccessDevice} />
        </div>
      </div>

      <div className="rounded-lg bg-white p-6">
        <div className="flex items-center space-x-3">
          <div className="rounded w-4 h-8 bg-slate-900"></div>
          <p className="font-semibold">Lịch sử hoạt động</p>
        </div>
        <AdminHistoryTable getAdminHistory={getAdminHistory} />
      </div>
    </div>
  )
}


export default DashboardContentAdmin