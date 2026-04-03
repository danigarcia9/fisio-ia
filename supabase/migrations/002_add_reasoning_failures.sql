alter table dev_feedback_log
add column if not exists reasoning_failures text[];
