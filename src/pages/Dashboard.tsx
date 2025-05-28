// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useLocationContext } from "../context/LocationContext";

export default function Dashboard() {
  const [stats, setStats] = useState({
    fridge: 0,
    freezer: 0,
    food: 0,
    delivery: 0,
    targets: { fridge: 0, freezer: 0, food: 12, delivery: 'N/A' },
  });

  const [progress, setProgress] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const { role, selectedLocation, setSelectedLocation, locations, userId } = useLocationContext();

  useEffect(() => {
    if (!selectedLocation || !userId) return;
    fetchStats();
    fetchChecklistProgress();
  }, [selectedLocation, selectedDate]);

  const fetchStats = async () => {
    const { data: temps } = await supabase
      .from("temperatures")
      .select("*")
      .eq("location_id", selectedLocation)
      .gte("timestamp", `${selectedDate}T00:00:00`)
      .lte("timestamp", `${selectedDate}T23:59:59`);

    const { data: units } = await supabase
      .from("units")
      .select("type")
      .eq("location_id", selectedLocation);

    const targets = {
      fridge: units.filter((u) => u.type === "fridge").length * 2,
      freezer: units.filter((u) => u.type === "freezer").length * 2,
      food: 12,
      delivery: "N/A",
    };

    const grouped = { fridge: 0, freezer: 0, food: 0, delivery: 0 };
    temps?.forEach((t) => {
      if (grouped[t.type] !== undefined) grouped[t.type]++;
    });

    setStats({ ...grouped, targets });
  };

  const fetchChecklistProgress = async () => {
    const { data: checklists } = await supabase
      .from("checklists")
      .select(`
        id, title, frequency,
        checklist_tasks!fk_checklist_tasks_checklist_id (
          id, description,
          checklist_subtasks!fk_checklist_subtasks_task_id (id, description)
        )
      `)
      .eq("location_id", selectedLocation)
      .in("frequency", ["daily", "weekly", "monthly"]);

    const { data: completions } = await supabase
      .from("checklist_subtask_completions")
      .select("subtask_id")
      .eq("user_id", userId)
      .eq("date", selectedDate);

    const completedSubtasks = new Set(completions?.map(c => c.subtask_id));

    const newProgress = { daily: 0, weekly: 0, monthly: 0 };
    ["daily", "weekly", "monthly"].forEach(freq => {
      const freqLists = checklists.filter(cl => cl.frequency === freq);
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
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
        <div className="flex gap-4 flex-wrap items-center">
          <div>
            <label className="text-sm block">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border px-3 py-1 rounded text-sm"
            />
          </div>
          {role === "admin" && (
            <div>
              <label className="text-sm block">Location:</label>
              <select
                value={selectedLocation || ""}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="border px-3 py-1 rounded text-sm"
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {["fridge", "freezer", "food", "delivery"].map((type) => (
          <div key={type} className="bg-white p-4 rounded shadow border hover:shadow-md transition-all">
            <h3 className="text-sm text-gray-500 capitalize">{type}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {stats[type]} <span className="text-sm text-gray-400">/ {stats.targets[type]}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">📋 Checklist Progression</h2>
        {["daily", "weekly", "monthly"].map((freq) => (
          <div key={freq} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="capitalize font-medium text-gray-600">{freq}</span>
              <span className="text-sm text-gray-500">{progress[freq].toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded">
              <div
                className="bg-emerald-500 h-3 rounded transition-all"
                style={{ width: `${progress[freq]}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
