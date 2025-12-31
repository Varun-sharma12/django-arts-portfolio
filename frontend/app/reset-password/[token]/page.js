"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm_password, setconfirm_password] = useState("");
  const [errors, setErrors] = useState({});
  // const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    password: "",
    confirm_password: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;
    // console.log(form);
    form.token = token;
    // console.log(form)
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/reset-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw data;
      }

setMessage("Password Reset Successfully. Redirecting to Login page...");
setTimeout(function(){
router.replace("/login");
},2000);
setLoading(false);

    } catch (error) {
      setErrors({ form: "Network error" });
      console.log(error);
      handleBackendError(error);
    }

    // setError("");

  }

function handleBackendError(error) {
  setLoading(true);
  if(typeof error === 'object'){
    console.log(error); 
    setErrors(error);
    setMessage("");
      setLoading(false);
  }
  else{
    setMessage("Something went wrong");
    setLoading(false);
  }
}



  // Change Listener of the Fields
  function handleChange(e) {
    console.log("hloo")
    setForm({ ...form, [e.target.name]: e.target.value });
    // console.log(form)
  }

  useEffect(() => {
    const newErrors = {};
    
    //    // Password validation
    if (!form.password) {
      // newErrors.password = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(
        form.password
      )
    ) {
      newErrors.password =
        "Min 12 chars, 1 uppercase, 1 lowercase, 1 number & 1 special character";
    }
    if (!form.confirm_password) {
      // newErrors.confirm_password = "confirm_password is required";
    } else if (form.confirm_password !== form.password   )
    {
      newErrors.confirm_password =
        "Password did not match";
    }
    setErrors(newErrors);
    console.log(newErrors);
  }, [form])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Reset Password
        </h1>

        {errors.api_error && (
          <p className="text-red-600 text-sm mb-4">{errors.api_error}</p>
        )}

        {message  && (
          <div className="mt-4 text-center text-sm text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className={`w-full p-2 border rounded ${errors.password ? "border-red-500" : "border-gray-300"
                }`}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
             {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className={`w-full p-2 border rounded ${errors.confirm_password ? "border-red-500" : "border-gray-300"
                }`}
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              required
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              onChange={() => setShowPassword((p) => !p)}
            />
            Show password
          </div>
          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

      </div>
    </div>
  );

}
