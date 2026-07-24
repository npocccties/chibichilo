# Changelog

All notable changes to this project will be documented in this file.

## [2026]

### Added

- CLI tool for learning behavior analysis CSV export (NII)
- Bulk synchronization of all course participants via CLI (NII)
- AGS grade submission for video viewing in tag management screen (OU)
- Learning activity tracking for video viewing in tag management screen (OU)
- Stored AGS line item URL in LTI resource link for grade submission without active LTI session (OU)
- Topic-level direct access and LTI Deep Linking support (NII)
- Configurable access control for learning analytics dashboard (NII)

### Changed

- Pass LTI context via client-side session storage when accessing from tag management screen (OU)
- Grade submission supports broadcasting to multiple LTI contexts when accessing from tag management screen (OU)
- Improved player settings retention across topic switches (NII)

## [2025]

### Added

- Deep Linking support from Blackboard (OU)
- Bulk learning analytics export for administrators (NII)
- View count visualization and learning analytics data (OU)
- LTI resource link record creation on student access when no record exists, and creator assignment on subsequent instructor access (OU)
- Book ID recording in activity and bookmark records (OU)

### Changed

- Enhanced version management with licenser field and saved parent ID (NII)
- Enhanced learning analytics export with additional LMS identifiers (NII)
- Modified analytics access control (OU)
- Improved system logging capabilities (OU)
- Optimized view count recording performance (OU)
- Optional tag/note registration and view count recording

## [2024]

### Added

- Version management feature (NII)
- Tag/note registration (OU)
- Word cloud (OU)
- View count recording (OU)
- Subtitle display memory

## [2023]

### Added

- Video thumbnail display
- Viewing status timeline (OU)
- Names and Role Provisioning Services support (OU)
- Synchronization with LMS course participants (OU)
- Separation of video material display information
- Zoom video integration with OAuth authentication
- Deep Linking support

### Changed

- Removal of IP address-based client authentication
- Video interaction log improvement (NII)

## [2022]

### Added

- Keyword registration (NII)
- Multiple author registration (NII)
- License registration (NII)
- Public access to video materials
- Video upload
- Video trimming
- Course-specific viewing history (OU)
- Student email address recording (OU)
- Playback speed memory (NII)
- LMS course integration management
- Assignment and Grade Services support
- Video material filter search

## [2021]

### Added

- LTI 1.1 authentication from Blackboard (OU)
- Viewing history (OU)
- Learning analytics (OU)
- Separate window display from embed (OU)
- Mobile device support
- YouTube integration
- Vimeo integration
- Video material duplication
- Video material sharing
- Video material reuse
- Video material import (NII)
- LTI 1.3 authentication from Moodle (NII)
- Zoom video integration
- LTI 1.3 authentication from Blackboard (OU)

## [2020]

### Added

- RDB support (NII)
- LTI 1.1 authentication from Moodle (NII)
- Role-based access control (NII)
- Video material registration (NII)
- Video material display (NII)
- Video interaction log output (NII)

### Changed

- Complete migration from PHP to TypeScript

## Development

- The initial development of this project was carried out by NII.

## Note

- Contribution attributions vary due to differences in documentation practices.

## Organization Abbreviations

- NII: National Institute of Informatics
- OU: Osaka University
