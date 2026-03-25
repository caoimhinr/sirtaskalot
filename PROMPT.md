# Description

Create a project "SirTaskalot" to keep track of tasks that need to be done. The main interface is a calendar view showing what tasks need to be done. Some will be at specific times during the day, some can run all day. Users can define a task with a name, icon, description. Checking a task as done should be very easy and quick. When checking a task for completion it's possible additional info needs to be provide. User can add select list options, number input, ... so more info can be added on task completion.

# Requirements

- Mobile first/responsive
 - Modern layout with light/dark mode, emulate Home Assistant style so it could run as an addon
 - Tailwind CSS
- OAuth login with in app user accounts or socials (Google/Github/...
- Dockerized
- Postgres database
- OpenTelemetry logging of user actions (save to separate db and provide dashboard)
- MCP server to pull data (read-only)
- Redis caching
- Tests for every layer
- Flyway migrations