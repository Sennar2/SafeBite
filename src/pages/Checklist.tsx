// src/pages/Checklist.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useLocationContext } from "../context/LocationContext";

export default function Checklist() {
  const { selectedLocation, userId } = useLocationContext();
  const [checklists, setChecklists] = useState<any[]>([]);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [counts, setCounts] = useState<{ [key: string]: { done: number; total: number } }>({});
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!selectedLocation || !userId) return;
    fetchChecklist();
  }, [selectedLocation, userId]);

  const fetchChecklist = async () => {
    setLoading(true);

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
      .eq("date", today);

    const completedSubtasks = new Set(completions?.map(c => c.subtask_id));
    const progressMap: { [key: string]: number } = {};
    const countsMap: { [key: string]: { done: number; total: number } } = {};

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

      progressMap[freq] = total > 0 ? (done / total) * 100 : 0;
      countsMap[freq] = { done, total };
    });

    setProgress(progressMap);
    setCounts(countsMap);
    setChecklists(checklists || []);
    setCompletedMap(Object.fromEntries([...completedSubtasks].map(id => [id, true])));
    setLoading(false);
  };

  const toggleSubtask = async (subtaskId: string, checked: boolean) => {
    await supabase.from("checklist_subtask_completions").upsert({
      subtask_id: subtaskId,
      user_id: userId,
      date: today,
      completed: checked,
      completed_at: checked ? new Date().toISOString() : null,
    });
    fetchChecklist();
  };

  const toggleSection = (freq: string) => {
    setOpenSections(prev => ({ ...prev, [freq]: !prev[freq] }));
  };

  const sortDailySections = (items: any[]) => {
    const order = ["Opening", "PM", "Closing"];
    return items.sort((a, b) => {
      const ai = order.indexOf(a.title);
      const bi = order.indexOf(b.title);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  };

  if (loading) return <div className="text-center text-gray-500 mt-10">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">✅ Today’s Checklist</h1>

      {["daily", "weekly", "monthly"].map(freq => {
        let items = checklists.filter(cl => cl.frequency === freq);
        if (freq === "daily") items = sortDailySections(items);

        const open = openSections[freq] ?? false;
        const pct = progress[freq]?.toFixed(0);
        const count = counts[freq] || { done: 0, total: 0 };

        return (
          <section key={freq} className="bg-white rounded shadow p-4">
            <button
              className="w-full text-left flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection(freq)}
            >
              <div>
                <h2 className="text-xl font-semibold capitalize text-indigo-700">{freq}</h2>
                <p className="text-sm text-gray-600">{count.done} / {count.total} completed</p>
              </div>
              <span className="text-indigo-600 font-bold text-lg">{pct}% ▾</span>
            </button>

            <div className="mt-2 mb-4 bg-gray-200 h-2 rounded">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${progress[freq] || 0}%` }}
              ></div>
            </div>

            {open && (
              <div className="mt-2 space-y-4">
                {items.map(cl => (
                  <div key={cl.id} className="border-l-4 border-indigo-300 pl-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">{cl.title}</h3>
                    {cl.checklist_tasks.map(task => (
                      <div key={task.id} className="mb-3">
                        <h4 className="text-gray-600 font-semibold mb-1">{task.description}</h4>
                        <ul className="pl-4 space-y-1">
                          {task.checklist_subtasks.map(sub => (
                            <li key={sub.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="accent-green-600 w-4 h-4"
                                checked={!!completedMap[sub.id]}
                                onChange={e => toggleSubtask(sub.id, e.target.checked)}
                              />
                              <span className="text-gray-800">{sub.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
