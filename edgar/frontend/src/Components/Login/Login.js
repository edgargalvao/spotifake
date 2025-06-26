import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import RegisterCard from "./RegisterCard";
import { useNavigate } from "react-router-dom";
import "../../Login.css";

const Login = () => {
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors } 
  } = useForm();

  const onLogin = async (data) => {
    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log("Login realizado:", result);
        navigate("/MainPage"); // Redireciona para a página principal após o login
      } else {
        alert("Usuário ou senha incorretos.");
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor." + err.message);
    }
  };
  return (
    <div className="login-page">
      <div className="container">
      <form onSubmit={handleSubmit(onLogin)}>
        <h1>Acesse o sistema</h1>
        <div className="input-field">
          <input
            type="text"
            placeholder="Usuário"
            {...register("username", { required: "Usuário é obrigatório" })}
          />
          <FaUser className="icon" />
          {errors.username && <p className="error">{errors.username.message}</p>}
        </div>
        <div className="input-field">
          <input
            type="password"
            placeholder="Senha"
            {...register("password", {
              required: "Senha é obrigatória",
              minLength: { value: 6, message: "Mínimo de 6 caracteres" }
            })}
          />
          <FaLock className="icon" />
          {errors.password && <p className="error">{errors.password.message}</p>}
        </div>
        <button type="submit">Login</button>
        <div className="signup-link">
          <p>
            Não tem uma conta?{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => setShowRegister(true)}
            >
              Registrar
            </button>
          </p>
        </div>
      </form>
      <RegisterCard
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={() => alert("Usuário registrado com sucesso!")}
      />
    </div> 
    </div>
  );
};

export default Login;
