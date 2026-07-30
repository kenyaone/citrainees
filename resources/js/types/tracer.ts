export interface CiProject {
    id: number;
    code: string;
    name: string;
    county: string | null;
    sub_county: string | null;
    notes?: string | null;
    alumni_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Alumni {
    id: number;
    user_id: number | null;
    ci_project_id: number | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    date_of_birth: string | null;
    gender: string | null;
    county: string | null;
    sub_county: string | null;
    sponsorship_start_year: number | null;
    sponsorship_end_year: number | null;
    form_four_year: number | null;
    kcse_index_number: string | null;
    kcse_mean_grade: string | null;
    current_status: string | null;
    bio: string | null;
    phone_primary: string | null;
    email_secondary: string | null;
    is_public: boolean;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    ci_project?: CiProject | null;
    education_records?: EducationRecord[];
    employment_records?: EmploymentRecord[];
    skills?: Skill[];
    verifier?: { id: number; name: string } | null;
}

export interface EducationRecord {
    id: number;
    alumni_id: number;
    institution_name: string;
    institution_type: string;
    course_name: string;
    level: string;
    specialization: string | null;
    start_year: number | null;
    end_year: number | null;
    completion_status: string;
    grade_awarded: string | null;
    is_public: boolean;
    verified_at: string | null;
    created_at: string;
}

export interface EmploymentRecord {
    id: number;
    alumni_id: number;
    employer_name: string;
    role_title: string;
    sector: string | null;
    employment_type: string | null;
    county: string | null;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
    is_public: boolean;
    verified_at: string | null;
    created_at: string;
}

export interface Skill {
    id: number;
    name: string;
    category: string | null;
    pivot?: { proficiency: string | null };
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface AlumniFilters {
    q?: string;
    project_id?: number | string;
    status?: string;
    cohort?: number | string;
}

export const ALUMNI_STATUS_OPTIONS = [
    { value: 'studying', label: 'Studying' },
    { value: 'employed', label: 'Employed' },
    { value: 'self_employed', label: 'Self-employed' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'seeking', label: 'Job seeking' },
    { value: 'unknown', label: 'Unknown' },
] as const;

export const INSTITUTION_TYPE_OPTIONS = [
    { value: 'tvet', label: 'TVET' },
    { value: 'university', label: 'University' },
    { value: 'college', label: 'College' },
    { value: 'vocational', label: 'Vocational' },
    { value: 'short_course', label: 'Short course' },
    { value: 'other', label: 'Other' },
] as const;

export const EDUCATION_LEVEL_OPTIONS = [
    { value: 'certificate', label: 'Certificate' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'higher_diploma', label: 'Higher Diploma' },
    { value: 'degree', label: "Bachelor's Degree" },
    { value: 'masters', label: "Master's Degree" },
    { value: 'phd', label: 'PhD' },
    { value: 'short_course', label: 'Short Course' },
] as const;

export const COMPLETION_STATUS_OPTIONS = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'deferred', label: 'Deferred' },
    { value: 'dropped_out', label: 'Dropped out' },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
    { value: 'full_time', label: 'Full-time' },
    { value: 'part_time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'attachment', label: 'Attachment' },
    { value: 'self_employed', label: 'Self-employed' },
    { value: 'volunteer', label: 'Volunteer' },
] as const;
