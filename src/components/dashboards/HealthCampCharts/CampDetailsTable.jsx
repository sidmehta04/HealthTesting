import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CampDetailsTable = ({ campData }) => {
  return (
    <Card className="md:col-span-2 mt-6">
      <CardHeader>
        <CardTitle>Detailed Camp Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Camp Code</TableHead>
                <TableHead>Nurse Name</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">Marketing Expense</TableHead>
                <TableHead className="text-right">
                  Operational Expense
                </TableHead>
                <TableHead>Report Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campData.map((camp) => (
                <TableRow key={camp.campCode}>
                  <TableCell className="font-medium">{camp.campCode}</TableCell>
                  <TableCell>{camp.nurseName}</TableCell>
                  <TableCell className="text-right">{camp.unitsSold}</TableCell>
                  <TableCell className="text-right">
                    ₹{camp.marketingExpense.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{camp.operationalExpense.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${
                        camp.reportStatus?.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {camp.reportStatus}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
