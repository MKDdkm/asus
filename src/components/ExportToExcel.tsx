import React from 'react';
import { Button } from './ui/button';
import { Download, FileSpreadsheet, Users, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface ExportToExcelProps {
  data: any[];
  filename: string;
  sheetName: string;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  icon?: boolean;
}

const ExportToExcel: React.FC<ExportToExcelProps> = ({
  data,
  filename,
  sheetName,
  buttonText = 'Export to Excel',
  variant = 'default',
  icon = true
}) => {
  const { toast } = useToast();

  const exportToExcel = () => {
    try {
      if (!data || data.length === 0) {
        toast({
          title: 'No Data',
          description: 'There is no data to export',
          variant: 'destructive'
        });
        return;
      }

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(data);

      // Set column widths
      const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate Excel file and trigger download
      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);

      toast({
        title: 'Export Successful',
        description: `Downloaded ${data.length} records to ${filename}_${timestamp}.xlsx`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data to Excel',
        variant: 'destructive'
      });
    }
  };

  return (
    <Button onClick={exportToExcel} variant={variant} className="gap-2">
      {icon && <Download className="h-4 w-4" />}
      {buttonText}
    </Button>
  );
};

export default ExportToExcel;

// Pre-configured export buttons for common use cases
export const ExportCitizensButton: React.FC<{ data: any[] }> = ({ data }) => (
  <ExportToExcel
    data={data}
    filename="citizens_data"
    sheetName="Citizens"
    buttonText="Export Citizens"
    variant="outline"
  />
);

export const ExportApplicationsButton: React.FC<{ data: any[] }> = ({ data }) => (
  <ExportToExcel
    data={data}
    filename="applications_data"
    sheetName="Applications"
    buttonText="Export Applications"
    variant="outline"
  />
);

export const ExportPaymentsButton: React.FC<{ data: any[] }> = ({ data }) => (
  <ExportToExcel
    data={data}
    filename="payments_data"
    sheetName="Payments"
    buttonText="Export Payments"
    variant="outline"
  />
);
