import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oanaqfiwxiwiujrgztrm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbmFxZml3eGl3aXVqcmd6dHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTYzMjUsImV4cCI6MjA1ODU5MjMyNX0.R3TviIy7SICOS074yxEMxRBllEWhRAnYoPHI8065P9U";
const supabase = createClient(supabaseUrl, supabaseKey);

const AnalyticsDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);
  const [stockUsage, setStockUsage] = useState([]);
  const [discountCustomers, setDiscountCustomers] = useState([]);

  useEffect(() => {
    fetchBestSellingMenuItems();
    fetchMonthlyRevenue();
    fetchCustomerOrderFrequency();
    fetchTopEmployees();
    fetchStockUsage();
    fetchDiscountEligibleCustomers();
  }, []);

  async function fetchBestSellingMenuItems() {
    const { data, error } = await supabase
      .from("order_details")
      .select("menu_item_id, quantity, menu_item:menu_item_id(menu_item_name)")
      .order("quantity", { ascending: false });

    if (!error) setMenuItems(data);
  }

  async function fetchMonthlyRevenue() {
    const { data, error } = await supabase.rpc("monthly_revenue");

    if (!error) setMonthlyRevenue(data);
  }

  async function fetchCustomerOrderFrequency() {
    const { data, error } = await supabase
      .from("orders")
      .select("customer_id, customers:user_id(first_name, last_name)");

    if (!error) setCustomerOrders(data);
  }

  async function fetchTopEmployees() {
    const { data, error } = await supabase
      .from("orders")
      .select("employee_id, employees:user_id(first_name, last_name)");

    if (!error) setTopEmployees(data);
  }

  async function fetchStockUsage() {
    const { data, error } = await supabase
      .from("inventory")
      .select(
        "item_name, no_in_stock, menu_item(menu_item_id, order_details(quantity))",
      );

    if (!error) setStockUsage(data);
  }

  async function fetchDiscountEligibleCustomers() {
    const { data, error } = await supabase
      .from("analytics")
      .select("customer_id, customers:user_id(first_name, last_name)")
      .eq("discount_eligibility", true);

    if (!error) setDiscountCustomers(data);
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6"> Restaurant Analytics</h1>

      {/* Best Selling Menu Items */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">Best Selling Menu Items</h2>
        {menuItems.length ? (
          <ul>
            {menuItems.map((item) => (
              <li key={item.menu_item_id} className="mb-2">
                {item.menu_item?.menu_item_name} - {item.quantity} sold
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3"> Monthly Revenue</h2>
        {monthlyRevenue.length ? (
          <ul>
            {monthlyRevenue.map((rev, index) => (
              <li key={index}>
                Month {rev.month}: ${rev.total}
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">Customer Order Frequency</h2>
        {customerOrders.length ? (
          <ul>
            {customerOrders.map((cust) => (
              <li key={cust.customer_id}>
                {cust.customers?.first_name} {cust.customers?.last_name}
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">
          Top Employees Handling Orders
        </h2>
        {topEmployees.length ? (
          <ul>
            {topEmployees.map((emp) => (
              <li key={emp.employee_id}>
                {emp.employees?.first_name} {emp.employees?.last_name}
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3"> Inventory Stock Usage</h2>
        {stockUsage.length ? (
          <ul>
            {stockUsage.map((item) => (
              <li key={item.item_name}>
                {item.item_name} - {item.no_in_stock} left
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">
          Customers Eligible for Discounts
        </h2>
        {discountCustomers.length ? (
          <ul>
            {discountCustomers.map((cust) => (
              <li key={cust.customer_id}>
                {cust.customers?.first_name} {cust.customers?.last_name}
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
