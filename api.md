- Xem PNL: get /api/departments/
Response: [
  {
    "id": "string",
    "name": "string",
    "code": "string",
    "description": "string",
    "department": "string",
    "department_name": "string",
    "department_code": "string",
    "application_count": "string",
    "managers": [
      {
        "id": 0,
        "email": "user@example.com",
        "first_name": "string",
        "last_name": "string"
      }
    ]
  }
]

- Xem domain: get /api/domains/
Response: [
  {
    "id": "string",
    "name": "string",
    "code": "string",
    "description": "string",
    "department": "string",
    "department_name": "string",
    "department_code": "string",
    "application_count": "string",
    "managers": [
      {
        "id": 0,
        "email": "user@example.com",
        "first_name": "string",
        "last_name": "string"
      }
    ]
  }
]

- Xem application: get /api/applications/
Response: [
  {
    "id": "string",
    "name": "string",
    "code": "string",
    "description": "string",
    "domain": "string",
    "domain_name": "string",
    "domain_code": "string",
    "department_name": "string",
    "owner": 0,
    "owner_detail": {
      "id": 0,
      "email": "user@example.com",
      "first_name": "string",
      "last_name": "string"
    },
    "is_active": true
  }
]