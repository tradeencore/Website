import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSpreadsheet } from 'lucide-react';

interface SpreadsheetData {
  timestamp: string;
  symbol: string;
  value: string;
}

export default function SpreadsheetTable() {
  const [data, setData] = useState<SpreadsheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpreadsheetData = async () => {
    try {
      const SHEET_ID = '1uOzYOgbP23GcgiOhZDnzIOrVRX5iL2tkN4M_lOt3n-k';
      const SHEET_NAME = 'Long-Term';
      const RANGE = `${SHEET_NAME}!A1:C`;
      const API_KEY = 'AIzaSyBhfK-A6Z2a1YNCZTJJ7n_0SPdscLwuLB4';
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}`
        + `?key=${API_KEY}`
        + '&majorDimension=ROWS'
        + '&valueRenderOption=UNFORMATTED_VALUE';
      
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        
        if (response.status === 403) {
          throw new Error('Access denied. Please check if the Google Sheets API is enabled in your Google Cloud Console.');
        } else if (response.status === 404) {
          throw new Error('Spreadsheet not found. Please check if the sheet ID and name are correct.');
        } else {
          throw new Error(`Failed to fetch spreadsheet data: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      if (!result.values) {
        throw new Error('No data received from spreadsheet');
      }
      
      const rows = result.values;
      
      // Skip header row and transform data
      const formattedData = rows.slice(1).map((row: string[]) => ({
        timestamp: row[0] || '',
        symbol: row[1] || '',
        value: row[2] || ''
      }));

      setData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpreadsheetData();
    // Fetch data every 5 seconds
    const interval = setInterval(fetchSpreadsheetData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Loading Data...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Unable to Access Spreadsheet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <div className="bg-amber-50 p-4 rounded-lg border border-[var(--tv-border-color)]">
            <h4 className="font-medium text-amber-900 mb-2">To fix this issue:</h4>
            <ol className="list-decimal list-inside text-sm text-amber-800 space-y-1">
              <li>Open the Google Sheet</li>
              <li>Click 'Share' in the top right</li>
              <li>Click 'Change to anyone with the link'</li>
              <li>Set access to 'Viewer'</li>
              <li>Click 'Done'</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[var(--tv-background)] text-[var(--tv-text-primary)]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-[var(--tv-text-primary)]">
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Long-Term Portfolio Data
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-[var(--tv-background-secondary)]">
            <TableRow>
              <TableHead className="font-semibold text-[var(--tv-text-primary)]">Date</TableHead>
              <TableHead className="font-semibold text-[var(--tv-text-primary)]">Stock</TableHead>
              <TableHead className="font-semibold text-[var(--tv-text-primary)]">Target Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} className="hover:bg-[var(--tv-background-secondary)]">
                <TableCell className="font-medium text-[var(--tv-text-primary)]">{row.timestamp}</TableCell>
                <TableCell className="font-semibold text-[var(--tv-button-primary)]">{row.symbol}</TableCell>
                <TableCell className="font-medium text-[var(--tv-text-primary)]">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
