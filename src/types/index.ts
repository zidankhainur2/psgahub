export type Course = {
  id: number;
  name: string;
  lecturer: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  role: "admin" | "user";
};

export type Task = {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  status: "todo" | "in_progress" | "done" | null;
  course_id: number | null;
  courses: { name: string } | null;
};

export type Schedule = {
  id: number;
  course_id: number | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  courses: {
    name: string;
    lecturer: string;
  } | null;
};

export type CashFlow = {
  id: number;
  description: string;
  amount: number; // numeric
  type: "income" | "expense";
  transaction_date: string | null; // date
  member_id: string | null; // uuid
  profiles: { full_name: string | null }[];
};

export type Announcement = {
  id: number;
  title: string;
  content: string;
  author_id: string | null;
  created_at: string | null;
  profiles: { full_name: string | null } | null;
};

export type Group = {
  id: number;
  name: string;
  course_id: number | null;
  created_at: string;
  created_by: string | null;
  courses: { name: string } | null;
  members?: GroupMember[];
};

export type GroupMember = {
  group_id: number;
  user_id: string;
  role: "member" | "leader";
  joined_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

