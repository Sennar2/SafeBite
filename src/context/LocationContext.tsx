import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../supabase/client";

type LocationContextValue = {
  locations: any[];
  selectedLocation: string | null;
  setSelectedLocation: (id: string | null) => void;
  role: string | null;
  userId: string | null;
  error: string | null;
};

const LocationContext = createContext<LocationContextValue | undefined>(
  undefined
);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndLocations = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;

        // If no logged-in user, stop here
        if (!user) {
          setUserId(null);
          return;
        }

        setUserId(user.id);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, location_id")
          .eq("id", user.id)
          .single();

        console.log("Fetched profile:", profile);

        if (!profile || profileError) {
          console.warn("No profile found for user:", user.email);
          setError("No profile found.");
          return;
        }

        setRole(profile.role);

        if (profile.role === "admin") {
          const { data: allLocations } = await supabase
            .from("locations")
            .select("*");

          const safeLocations = allLocations || [];
          setLocations(safeLocations);

          if (!selectedLocation && safeLocations.length > 0) {
            setSelectedLocation(safeLocations[0].id);
          }
        } else if (profile.location_id) {
          const { data: loc } = await supabase
            .from("locations")
            .select("*")
            .eq("id", profile.location_id)
            .single();

          if (loc) {
            setLocations([loc]);
            setSelectedLocation(loc.id);
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        setError("Failed to load profile.");
      }
    };

    fetchUserAndLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: LocationContextValue = {
    locations,
    selectedLocation,
    setSelectedLocation,
    role,
    userId,
    error,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    // This gives a clearer error if the provider is missing
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return ctx;
};
