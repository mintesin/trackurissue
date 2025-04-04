# Model Relationships Documentation

## Company-Employee Relationship
- **Type**: One-to-Many (Company has many Employees)
- **Implementation**: 
  - Employee model contains `company: Schema.Types.ObjectId` field
  - No back-reference in Company model

### Query Patterns:

#### Basic Queries:
```javascript
// Get employees for a company
const employees = await employeeModel.find({ company: companyId });

// Get company for an employee
const employee = await employeeModel.findById(employeeId);
const company = await companyModel.findById(employee.company);
```

#### Field Selection:
```javascript
// Get only specific fields (lean + select)
const employees = await employeeModel.find({ company: companyId })
  .select('firstName lastName employeeEmail')
  .lean();

// Get nested field selection
const company = await companyModel.findById(companyId)
  .select('companyName adminEmail -_id'); // Exclude _id

// Get paginated results with selected fields
const employees = await employeeModel.find({ company: companyId })
  .select('firstName lastName')
  .skip(0).limit(10)
  .sort({ lastName: 1 });
```

#### Pagination Implementation:

**Backend (API Endpoint):**
```javascript
// Example route for paginated employees
router.get('/employees', async (req, res) => {
  const { companyId, page = 1, limit = 10 } = req.query;
  
  const employees = await employeeModel.find({ company: companyId })
    .select('firstName lastName email')
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const count = await employeeModel.countDocuments({ company: companyId });

  res.json({
    data: employees,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});
```

**Frontend (React Example):**
```javascript
function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEmployees = async (page) => {
    const res = await axios.get(`/api/employees?companyId=123&page=${page}&limit=10`);
    setEmployees(res.data.data);
    setTotalPages(res.data.totalPages);
    setCurrentPage(res.data.currentPage);
  };

  useEffect(() => { fetchEmployees(1); }, []);

  return (
    <div>
      {/* Employee list rendering */}
      {employees.map(emp => (
        <div key={emp._id}>{emp.firstName} {emp.lastName}</div>
      ))}
      
      {/* Pagination controls */}
      <div className="pagination">
        {Array.from({length: totalPages}, (_, i) => (
          <button 
            key={i+1}
            onClick={() => fetchEmployees(i+1)}
            disabled={currentPage === i+1}
          >
            {i+1}
          </button>
        ))}
      </div>
    </div>
  );
}
```

#### Combined Queries:
```javascript
// Get all company data with selected fields
const [employees, teams, issues] = await Promise.all([
  employeeModel.find({ company: companyId }).select('firstName lastName'),
  teamModel.find({ company: companyId }).select('teamName'),
  issueModel.find({ company: companyId }).select('title status')
]);
```

### Best Practices:
- Use `.select()` to limit returned fields and improve performance
- Add `.lean()` for read-only operations to get plain JS objects
- Create indexes on frequently queried fields
- Maintain consistent field names across related models
- Document all relationship patterns in this file
