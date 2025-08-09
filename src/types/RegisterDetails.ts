export type RegisterDetails = {
    username: string;
    email: string;
    password: string;
    phoneNo: string;
    location: string;
    role: "USER" | "SELLER"; // Add more roles if needed
    roomNo: string;
    hostelName: string;
};
