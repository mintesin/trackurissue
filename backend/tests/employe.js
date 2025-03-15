const employees = [
    {
        firstName: 'Jane',
        lastName: 'Doe',
        streetNumber: '123',
        birthDate: new Date('1990-05-15'),
        city: 'Los Angeles',
        state: 'CA',
        zipcode: '90001',
        country: 'USA',
        favoriteWord: 'Integrity',
        password: 'securePassword123', // Remember to hash this before saving in production!
        authorization: 'teammember',
        company: '60e73b2f5f1b2f001f48893f', // Replace with actual Company ObjectId
        team: '60e73b2f5f1b2f001f48894f' // Replace with actual Team ObjectId (optional)
    },
    {
        firstName: 'John',
        lastName: 'Smith',
        streetNumber: '456',
        birthDate: new Date('1985-03-20'),
        city: 'New York',
        state: 'NY',
        zipcode: '10001',
        country: 'USA',
        favoriteWord: 'Innovation',
        password: 'securePassword456', // Remember to hash this before saving in production!
        authorization: 'admin',
        company: '60e73b2f5f1b2f001f48893e', // Replace with actual Company ObjectId
        team: null // No team assigned for this employee
    },
    {
        firstName: 'Emily',
        lastName: 'Johnson',
        streetNumber: '789',
        birthDate: new Date('1992-11-30'),
        city: 'Chicago',
        state: 'IL',
        zipcode: '60601',
        country: 'USA',
        favoriteWord: 'Excellence',
        password: 'securePassword789', // Remember to hash this before saving in production!
        authorization: 'teamleader',
        company: '60e73b2f5f1b2f001f48893f', // Replace with actual Company ObjectId
        team: '60e73b2f5f1b2f001f48894f' // Replace with actual Team ObjectId
    },
    {
        firstName: 'Michael',
        lastName: 'Brown',
        streetNumber: '321',
        birthDate: new Date('1998-02-05'),
        city: 'San Francisco',
        state: 'CA',
        zipcode: '94103',
        country: 'USA',
        favoriteWord: 'Teamwork',
        password: 'securePassword000', // Remember to hash this before saving in production!
        authorization: 'teammember',
        company: '60e73b2f5f1b2f001f48893f', // Replace with actual Company ObjectId
        team: null // No team assigned for this employee
    }
];

// Exporting the employees array if needed
export default employees;