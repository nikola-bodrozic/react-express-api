import React, { useState, useEffect } from "react";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import axios from "axios";

interface Item {
  id: number;
  post: string;
  username: string;
}

const Home: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [first, setFirst] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [first, rows]);

  const loadData = async () => {
    setLoading(true);
    try {
      const page = Math.floor(first / rows) + 1;
      const response = await axios.get("http://localhost:4000/api/v1/table", {
        params: {
          page: page,
          pageSize: rows,
        },
      });
      setItems(response.data.items);
      setTotalRecords(response.data.totalItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios Error Response:", error.response);
      }
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event: DataTablePageEvent) => {
    setFirst(event.first);
    setRows(event.rows);
  };
  const actionBodyTemplate = (rowData: Item) => {
    return (
      <React.Fragment>
        <Button
          label="Info"
          severity="success"
          onClick={() => showAllData(rowData)}
        />
      </React.Fragment>
    );
  };
  const showAllData = (item: Item) => {
    alert(JSON.stringify(item, null, 2));
  };
  return (
    <div>
      {loading && <div>Loading...</div>}
      <h2>Welcome to Home Page</h2>
      <DataTable
        value={items}
        lazy
        first={first}
        rows={rows}
        showGridlines
        totalRecords={totalRecords}
        onPage={onPageChange}
        loading={loading}
        paginator={totalRecords > rows}
      >
        <Column field="post" header="Post" />
        <Column field="username" header="Username" />
        <Column body={actionBodyTemplate} header="Action" />
      </DataTable>
      {totalRecords > rows && (
        <div style={{ textAlign: "center" }}>
          <Button
            label="Previous"
            disabled={first === 0 || loading}
            onClick={() => setFirst(Math.max(0, first - rows))}
          />
          <Button
            label="Next"
            disabled={first + rows >= totalRecords || loading}
            onClick={() =>
              setFirst(Math.min(totalRecords - rows, first + rows))
            }
          />
        </div>
      )}
    </div>
  );
};

export default Home;
