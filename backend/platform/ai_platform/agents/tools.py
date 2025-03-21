
course_content_tool = {
                "type": "function",
                "function": {
                    "name": "get_course_content",
                    "description": "Fetches course content details such as lectures, assignments, or week-wise schedules from the Seek Portal database.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "course_id": {"type": "integer", "description": "The ID of the course to fetch content for."},
                            "week_no": {"type": "integer", "description": "The week number to filter content by (optional)."},
                            "lecture_no": {"type": "integer", "description": "The lecture number within the week (optional)."},
                            "is_transcript_required": {"type": "boolean", "description": "Whether to include the lecture transcript (default: false).", "default": False},
                            "graded_assignment_id": {"type": "integer", "description": "The ID of a graded assignment to fetch (optional)."},
                            "practice_assignment_id": {"type": "integer", "description": "The ID of a practice assignment to fetch (optional)."}
                        },
                        "required": ["course_id"]
                    }
                }
            }
