import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useAuth } from "../context/AuthContext";
import { useMultiTenancy } from "../context/MultiTenancyContext";

export default function Dashboard() {
  const { profile } = useAuth();
  const { selectedLocation, selectedCompany } = useMultiTenancy();

  const [stats, setStats] = useState({
    fridge: 0,
    freezer: 0,
    food: 0,
    delivery: 0,
    targets: { fridge: 0, freezer: 0, food: 12, delivery: 'N/A' },
  });

  const [progress, setProgress] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedLocation || !profile?.company_id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    Promise.all([fetchStats(), fetchChecklistProgress()])
      .finally(() => setLoading(false));
  }, [selectedLocation, selectedDate, profile?.company_id]);

  const fetchStats = async () => {
    try {
      const { data: temps } = await supabase
        .from("temperatures")
        .select("*")
        .eq("company_id", profile?.company_id)
        .eq("location_id", selectedLocation?.id)
        .gte("timestamp", `${selectedDate}T00:00:00`)
        .lte("timestamp", `${selectedDate}T23:59:59`);

      const { data: units } = await supabase
        .from("units")
        .select("type")
        .eq("company_id", profile?.company_id)
        .eq("location_id", selectedLocation?.id);

      const targets = {
        fridge: units?.filter((u) => u.type === "fridge").length * 2 || 0,
        freezer: units?.filter((u) => u.type === "freezer").length * 2 || 0,
        food: 12,
        delivery: "N/A",
      };

      const grouped = { fridge: 0, freezer: 0, food: 0, delivery: 0 };
      temps?.forEach((t) => {
        if (grouped[t.type] !== undefined) grouped[t.type]++;
      });

      setStats({ ...grouped, targets });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchChecklistProgress = async () => {
    try {
      const { data: checklists } = await supabase
        .from("checklists")
        .select(`
          id, title, frequency,
          checklist_tasks!fk_checklist_tasks_checklist_id (
            id, description,
            checklist_subtasks!fk_checklist_subtasks_task_id (id, description)
          )
        `)
        .eq("company_id", profile?.company_id)
        .eq("location_id", selectedLocation?.id)
        .in("frequency", ["daily", "weekly", "monthly"]);

      const { data: completions } = await supabase
        .from("checklist_subtask_completions")
        .select("subtask_id")
        .eq("company_id", profile?.company_id)
        .eq("user_id", profile?.id)
        .eq("date", selectedDate);

      const completedSubtasks = new Set(completions?.map(c => c.subtask_id));

      const newProgress = { daily: 0, weekly: 0, monthly: 0 };
      ["daily", "weekly", "monthly"].forEach(freq => {
        const freqLists = checklists?.filter(cl => cl.frequency === freq) || [];
        let total = 0, done = 0;

        freqLists.forEach(cl =>
          cl.checklist_tasks.forEach(task =>
            task.checklist_subtasks.forEach(sub => {
              total++;
              if (completedSubtasks.has(sub.id)) done++;
            })
          )
        );

        newProgress[freq] = total > 0 ? (done / total) * 100 : 0;
      });

      setProgress(newProgress);
    } catch (error) {
      console.error("Error fetching checklist progress:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!selectedLocation) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Location Selected</h2>
          <p className="text-yellow-700">Please select a location from the header to view the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            {selectedCompany?.name} • {selectedLocation?.name}
          </p>
        </div>
        <div className="flex gap-4 flex-wrap items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fridge Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">🧊 Fridge</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.fridge}</p>
          <p className="text-xs text-gray-500 mt-2">Target: {stats.targets.fridge}</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{
                width: `${stats.targets.fridge > 0 ? (stats.fridge / stats.targets.fridge) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Freezer Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">❄️ Freezer</h3>
          <p className="text-3xl font-bold text-cyan-600">{stats.freezer}</p>
          <p className="text-xs text-gray-500 mt-2">Target: {stats.targets.freezer}</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all"
              style={{
                width: `${stats.targets.freezer > 0 ? (stats.freezer / stats.targets.freezer) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Food Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">🍽️ Food</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.food}</p>
          <p className="text-xs text-gray-500 mt-2">Target: {stats.targets.food}</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{
                width: `${stats.targets.food > 0 ? (stats.food / stats.targets.food) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Delivery Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">📦 Delivery</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.delivery}</p>
          <p className="text-xs text-gray-500 mt-2">Target: {stats.targets.delivery}</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{
                width: "0%",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">📅 Daily Checklists</h3>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-green-600">{Math.round(progress.daily)}%</p>
            <p className="text-sm text-gray-500 mb-1">Complete</p>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${progress.daily}%` }}
            ></div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">📆 Weekly Checklists</h3>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-blue-600">{Math.round(progress.weekly)}%</p>
            <p className="text-sm text-gray-500 mb-1">Complete</p>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${progress.weekly}%` }}
            ></div>
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">📊 Monthly Checklists</h3>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-purple-600">{Math.round(progress.monthly)}%</p>
            <p className="text-sm text-gray-500 mb-1">Complete</p>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${progress.monthly}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
