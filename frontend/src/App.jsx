import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Componente principal de la aplicación.
 * Maneja el estado de autenticación, verificación de salud de la API y el enrutamiento base.
 * Muestra el panel de administración si el usuario está autenticado, o la pantalla de inicio de sesión/registro.
 *
 * @returns {JSX.Element} El componente raíz renderizado.
 */
function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [activeTab, setActiveTab] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);

    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') setApiStatus('Online 🟢');
        else setApiStatus('Error 🔴');
      })
      .catch(() => setApiStatus('Offline 🔴'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setActiveTab('login');
  };

  const handleBuyTickets = (movie) => {
    setSelectedMovie(movie);
    setActiveTab('seats');
  };

  return (
    <>
      {isAuthenticated ? (
        <AdminPanel onBack={handleLogout} />
      ) : (
        <div className="min-h-screen bg-[#0b0b0f] flex flex-col items-center justify-center relative overflow-hidden font-sans">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#fdd835]/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="mb-2 z-10 text-center animate-fade-in">
            <span className="text-6xl text-[#fdd835] mb-4 block">🎬</span>
            <h1 className="text-5xl font-black text-[#fdd835] tracking-widest uppercase">CINE</h1>
          </div>
          
          <div className="w-full z-10 relative">
            {activeTab === 'login' ? (
              <LoginForm onSwitch={() => setActiveTab('register')} onLoginSuccess={() => { setIsAuthenticated(true); setActiveTab('dashboard'); }} />
            ) : (
              <RegisterForm onSwitch={() => setActiveTab('login')} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Componente que muestra las opciones principales para el usuario (cartelera, reservas, perfil).
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.onNavigate - Función callback para manejar la navegación entre vistas.
 * @returns {JSX.Element} Panel de control interactivo.
 */
function Dashboard({ onNavigate }) {
  const options = [
    { id: 'movies', title: 'Explorar Cartelera', desc: 'Descubre los últimos estrenos y compra tus entradas.', icon: '🍿', color: 'bg-red-500/10 border-red-500/30 hover:border-cinema-red' },
    { id: 'my_reservations', title: 'Mis Reservas', desc: 'Gestiona tus boletos y mira tu historial de compras.', icon: '🎟️', color: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500' },
    { id: 'profile', title: 'Mi Perfil', desc: 'Actualiza tus datos personales y métodos de pago.', icon: '👤', color: 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500' },
    { id: 'admin', title: 'Administración', desc: 'Gestiona películas, salas y horarios del cine.', icon: '⚙️', color: 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500' },
  ];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl mb-4">Panel Principal</h2>
        <p className="text-gray-400 text-xl">¿Qué te gustaría hacer hoy en CineMagic?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {options.map((opt) => (
          <div 
            key={opt.id} 
            onClick={() => onNavigate(opt.id)}
            className={`cursor-pointer border rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 group ${opt.color}`}
          >
            <div className="text-5xl mb-6 transform transition-transform duration-300 group-hover:scale-110">
              {opt.icon}
            </div>
            <h3 className="text-2xl font-bold mb-3">{opt.title}</h3>
            <p className="text-gray-400">{opt.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyReservations({ onBack }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/reservations/')
      .then(res => res.json())
      .then(data => {
        setReservations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reservations:", err);
        setLoading(false);
      });
  }, []);

  const handleDownloadInvoice = (reservationId) => {
    // Aquí puedes redirigir al endpoint de descarga de factura
    alert(`Descargando factura para la reserva #${reservationId}...`);
    // window.open(`http://localhost:8000/api/v1/reservations/${reservationId}/invoice`, '_blank');
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
        ← Volver al Panel
      </button>
      <div className="glass-panel py-10 px-8 text-center">
        <div className="text-6xl mb-6">🎫</div>
        <h2 className="text-3xl mb-4">Mis Reservas</h2>
        
        {loading ? (
          <p className="text-gray-400 mb-8">Cargando reservas...</p>
        ) : reservations.length === 0 ? (
          <>
            <p className="text-gray-400 mb-8">Aún no tienes reservas activas.</p>
            <button onClick={() => onBack()} className="py-3 px-8 rounded-lg font-heading font-semibold bg-cinema-red text-white hover:bg-cinema-red-hover transition-colors">
              Ir a Cartelera
            </button>
          </>
        ) : (
          <div className="mt-8 space-y-4 text-left">
            {reservations.map((res) => (
              <div key={res.id} className="bg-[#1a1a22] border border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-blue-500/30 transition-colors">
                <div>
                  <h3 className="text-xl font-bold text-white">Reserva #{res.id}</h3>
                  <p className="text-gray-400 text-sm mt-1">Fecha: {new Date(res.created_at).toLocaleDateString()}</p>
                  <p className="text-[#fdd835] font-bold mt-2">Total: ${res.total_price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold self-center ${res.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {res.status.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => handleDownloadInvoice(res.id)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-blue-900/20"
                  >
                    📄 Descargar Factura
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MovieGrid({ isAuthenticated, onBuyTickets, hideTitle }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/movies/active')
      .then(res => res.json())
      .then(data => {
        // Asignar precio base estático si el modelo no lo tiene para propósitos visuales
        const moviesWithPrice = data.map(m => ({ ...m, price: 5.00 }));
        setMovies(moviesWithPrice);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching movies:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Cargando cartelera...</div>;
  }

  return (
    <div className="animate-fade-in">
      {!hideTitle && (
        <div className="text-center mb-12">
          <h2 className="text-5xl mb-4">Cartelera Estelar</h2>
          <p className="text-gray-400 text-xl">Reserva tus asientos en la mejor experiencia cinematográfica.</p>
        </div>
      )}
      
      {movies.length === 0 ? (
        <div className="text-center py-20 glass-panel max-w-2xl mx-auto">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-2xl text-gray-300">La cartelera está vacía</h3>
          <p className="text-gray-500 mt-2">No hay películas disponibles en este momento. Vuelve más tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {movies.map(movie => (
            <div key={movie.id} className="bg-cinema-card border border-cinema-glass rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 hover:border-cinema-red/30 flex flex-col group">
              {movie.poster_url ? (
                <div 
                  className="h-96 bg-cover bg-center" 
                  style={{ backgroundImage: `url(http://localhost:8000${movie.poster_url})` }}
                ></div>
              ) : (
                <div className="h-96 bg-[#1a1a20] flex items-center justify-center relative overflow-hidden">
                  <span className="text-6xl opacity-20 transform transition-transform duration-500 group-hover:scale-110">🎬</span>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{movie.title}</h3>
                  <span className="text-[#fdd835] font-bold text-lg">${movie.price.toFixed(2)}</span>
                </div>
                <p className="text-gray-400 text-sm mb-6">{movie.desc}</p>
                {isAuthenticated ? (
                  <button onClick={() => onBuyTickets(movie)} className="mt-auto w-full py-3 px-6 rounded-lg font-bold bg-[#fdd835] text-black transition-all duration-300 hover:bg-[#fff04d] hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(253,216,53,0.4)]">
                    Elegir Asientos
                  </button>
                ) : (
                  <button className="mt-auto w-full py-3 px-6 rounded-lg font-heading font-semibold bg-gray-700 text-gray-300 cursor-not-allowed">
                    Inicia sesión para comprar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SeatSelector({ movie, onBack }) {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];
  
  // Dummy occupied seats
  const occupiedSeats = ['A3', 'A4', 'C5', 'C6', 'E8'];
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isReserving, setIsReserving] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleSeat = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleReserve = async () => {
    setIsReserving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        showtime_id: movie.id, // Usando el id de la película como id de función por ahora
        total_price: selectedSeats.length * movie.price,
        seat_ids: [1, 2] // Asientos de ejemplo
      };

      const response = await fetch('http://localhost:8000/api/v1/reservations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        alert('Hubo un error al confirmar la reserva.');
      }
    } catch (error) {
      alert('No se pudo conectar con el servidor.');
    } finally {
      setIsReserving(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] animate-fade-in">
        <div className="glass-panel w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎟️</div>
          <h2 className="text-3xl mb-4 text-green-400">¡Reserva Confirmada!</h2>
          <p className="text-gray-300 mb-2">Película: <strong>{movie.title}</strong></p>
          <p className="text-gray-300 mb-6">Asientos: <strong>{selectedSeats.join(', ')}</strong></p>
          <button onClick={onBack} className="w-full py-3 px-6 rounded-lg font-heading font-semibold bg-cinema-red text-white hover:bg-cinema-red-hover">
            Volver a Cartelera
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
        ← Volver
      </button>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 glass-panel">
          <h2 className="text-2xl mb-8 text-center">{movie.title} - Sala Premium</h2>
          
          {/* Pantalla */}
          <div className="mb-12">
            <div className="h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 rounded-full blur-[2px]"></div>
            <div className="h-12 bg-gradient-to-b from-white/10 to-transparent flex items-start justify-center pt-2 text-sm text-gray-500 tracking-widest uppercase">
              Pantalla
            </div>
          </div>

          {/* Cuadrícula de Asientos */}
          <div className="flex flex-col gap-4 items-center">
            {rows.map(row => (
              <div key={row} className="flex gap-2 sm:gap-4 items-center">
                <span className="w-6 text-gray-500 font-bold">{row}</span>
                <div className="flex gap-2 sm:gap-3">
                  {cols.map(col => {
                    const seatId = `${row}${col}`;
                    const isOccupied = occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    
                    let seatClass = "w-8 h-8 sm:w-10 sm:h-10 rounded-t-lg rounded-b-sm cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-bold ";
                    if (isOccupied) seatClass += "bg-[#1a1a22] text-gray-600 cursor-not-allowed";
                    else if (isSelected) seatClass += "bg-[#fdd835] text-black shadow-[0_0_15px_rgba(253,216,53,0.5)] transform scale-110";
                    else seatClass += "bg-white/5 border border-white/10 hover:bg-white/20 text-transparent hover:text-white";

                    // Crear pasillo en el medio
                    const marginClass = col === 4 ? "mr-4 sm:mr-8" : "";

                    return (
                      <div 
                        key={seatId} 
                        className={`${seatClass} ${marginClass}`}
                        onClick={() => toggleSeat(seatId)}
                        title={seatId}
                      >
                        {col}
                      </div>
                    );
                  })}
                </div>
                <span className="w-6 text-gray-500 font-bold text-right">{row}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-8 mt-12 text-sm text-gray-400">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white/5 border border-white/10 rounded-sm"></div> Libre</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#fdd835] rounded-sm shadow-[0_0_10px_rgba(253,216,53,0.4)]"></div> Seleccionado</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#1a1a22] rounded-sm"></div> Ocupado</div>
          </div>
        </div>

        {/* Panel de Resumen */}
        <div className="w-full md:w-80">
          <div className="glass-panel sticky top-24">
            <h3 className="text-xl font-bold mb-4 border-b border-cinema-glass pb-4">Resumen</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Boletos:</span>
              <span>{selectedSeats.length}</span>
            </div>
            <div className="flex justify-between mb-6">
              <span className="text-gray-400">Asientos:</span>
              <span className="font-bold text-[#fdd835] text-right">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Ninguno'}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold mb-8 border-t border-[#1f1f27] pt-4">
              <span>Total:</span>
              <span className="text-[#fdd835]">${(selectedSeats.length * movie.price).toFixed(2)}</span>
            </div>
            <button 
              onClick={handleReserve}
              disabled={selectedSeats.length === 0 || isReserving}
              className="w-full py-4 px-6 rounded-xl font-bold bg-[#fdd835] text-black transition-all duration-300 hover:bg-[#fff04d] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(253,216,53,0.3)]"
            >
              {isReserving ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSwitch, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMsg({ text: '¡Sesión iniciada con éxito!', type: 'success' });
        localStorage.setItem('token', data.access_token);
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        setStatusMsg({ text: data.detail || 'Credenciales inválidas.', type: 'error' });
      }
    } catch (error) {
      setStatusMsg({ text: 'No se pudo conectar con el servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] animate-fade-in">
      <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-10 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-9xl opacity-[0.03]">👤</div>
        
        <div className="relative z-10 text-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-widest uppercase">Bienvenido</h2>
          <p className="text-gray-400 mt-2">Ingresa tus credenciales para acceder</p>
        </div>
        
        {statusMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium text-center ${statusMsg.type === 'success' ? 'bg-[#1a2e1e] text-[#4caf50] border border-[#2e5235]' : 'bg-[#2a1a1f] text-[#ff5252] border border-[#3a1a1f]'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div>
            <label className="block text-gray-500 text-xs font-bold mb-2 tracking-widest uppercase">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@cine.com" 
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-bold mb-2 tracking-widest uppercase">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-2 rounded-xl font-bold bg-[#fdd835] text-black transition-all hover:bg-[#fff04d] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(253,216,53,0.3)]"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p className="text-gray-500 text-sm text-center mt-8 relative z-10">
          ¿No tienes una cuenta?{' '}
          <button onClick={onSwitch} className="text-[#fdd835] hover:text-white transition-colors font-bold underline decoration-[#fdd835]/50 underline-offset-4">
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}

function RegisterForm({ onSwitch }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, phone, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMsg({ text: '¡Cuenta creada! Ya puedes iniciar sesión.', type: 'success' });
        setFullName('');
        setPhone('');
        setEmail('');
        setPassword('');
      } else {
        setStatusMsg({ text: data.detail || 'Error al registrar.', type: 'error' });
      }
    } catch (error) {
      setStatusMsg({ text: 'No se pudo conectar.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] animate-fade-in">
      <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-10 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-9xl opacity-[0.03]">📋</div>
        
        <div className="relative z-10 text-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-widest uppercase">Crear Cuenta</h2>
          <p className="text-gray-400 mt-2">Únete al panel de gestión</p>
        </div>
        
        {statusMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium text-center ${statusMsg.type === 'success' ? 'bg-[#1a2e1e] text-[#4caf50] border border-[#2e5235]' : 'bg-[#2a1a1f] text-[#ff5252] border border-[#3a1a1f]'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="relative z-10 space-y-4">
          <div>
            <label className="block text-gray-500 text-xs font-bold mb-2 tracking-widest uppercase">Nombre Completo</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Juan Pérez" 
              className="w-full p-3.5 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-bold mb-2 tracking-widest uppercase">Teléfono</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890" 
              className="w-full p-3.5 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-bold mb-2 tracking-widest uppercase">Correo</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com" 
              className="w-full p-3.5 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-bold mb-2 tracking-widest uppercase">Contraseña</label>
            <input 
              type="password" 
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres" 
              className="w-full p-3.5 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 rounded-xl font-bold bg-[#fdd835] text-black transition-all hover:bg-[#fff04d] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(253,216,53,0.3)]"
          >
            {loading ? 'Registrando...' : 'Completar Registro'}
          </button>
        </form>
        <p className="text-gray-500 text-sm text-center mt-6 relative z-10">
          ¿Ya tienes cuenta?{' '}
          <button onClick={onSwitch} className="text-[#fdd835] hover:text-white transition-colors font-bold underline decoration-[#fdd835]/50 underline-offset-4">
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}

/**
 * Panel de Administración general que envuelve el menú lateral (Sidebar) y el contenido principal.
 * Maneja el estado de la sección actual (dashboard, películas, salas, reservas, etc.).
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.onBack - Función para cerrar sesión o volver atrás.
 * @returns {JSX.Element} Interfaz de administración.
 */
function AdminPanel({ onBack }) {
  const [currentSection, setCurrentSection] = useState('dashboard');

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0b0f] text-white flex font-sans animate-fade-in">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121217] border-r border-[#1f1f27] flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-3xl font-black text-[#fdd835] tracking-widest">CINE</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
          <div className="mb-6 px-4">
            <h3 className="text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">Principal</h3>
            <SidebarItem icon="🏠" label="Dashboard" active={currentSection === 'dashboard'} onClick={() => setCurrentSection('dashboard')} />
            <SidebarItem icon="🎟️" label="Boletería" active={currentSection === 'tickets'} onClick={() => setCurrentSection('tickets')} />
          </div>

          <div className="mb-6 px-4">
            <h3 className="text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">Catálogo</h3>
            <SidebarItem icon="🎬" label="Películas" active={currentSection === 'movies'} onClick={() => setCurrentSection('movies')} />
            <SidebarItem icon="🏷️" label="Géneros" active={currentSection === 'genres'} onClick={() => setCurrentSection('genres')} />
          </div>

          <div className="mb-6 px-4">
            <h3 className="text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">Operaciones</h3>
            <SidebarItem icon="🪑" label="Salas" active={currentSection === 'halls'} onClick={() => setCurrentSection('halls')} />
            <SidebarItem icon="📋" label="Ver puestos" active={currentSection === 'seats'} onClick={() => setCurrentSection('seats')} />
            <SidebarItem icon="⏱️" label="Funciones" active={currentSection === 'showtimes'} onClick={() => setCurrentSection('showtimes')} />
          </div>

          <div className="mb-6 px-4">
            <h3 className="text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">Clientes</h3>
            <SidebarItem icon="👥" label="Clientes" active={currentSection === 'clients'} onClick={() => setCurrentSection('clients')} />
            <SidebarItem icon="🎫" label="Reservas" active={currentSection === 'reservations'} onClick={() => setCurrentSection('reservations')} />
            <SidebarItem icon="📜" label="Historial" active={currentSection === 'history'} onClick={() => setCurrentSection('history')} />
            <SidebarItem icon="🛡️" label="Administradores" active={currentSection === 'admins'} onClick={() => setCurrentSection('admins')} />
          </div>
        </div>
        
        <div className="p-4 border-t border-[#1f1f27] text-sm text-gray-500 font-medium truncate">
          admin@cinemagic.com
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-[#0b0b0f] overflow-hidden">
        {/* Topbar */}
        <header className="h-20 border-b border-[#1f1f27] flex items-center justify-between px-8 bg-[#121217]">
          <div>
            <h2 className="text-xl font-bold">{currentSection === 'dashboard' ? 'Dashboard' : currentSection === 'movies' ? 'Películas' : 'Módulo'}</h2>
            <p className="text-sm text-gray-400">Bienvenido al panel de gestión</p>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 px-6 py-2.5 bg-[#2a1a1f] text-[#ff5252] border border-[#3a1a1f] rounded-lg text-sm font-semibold hover:bg-[#3a1a1f] transition-colors">
            <span>🚪</span> Cerrar sesión
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {currentSection === 'dashboard' && <AdminDashboardContent />}
          {currentSection === 'tickets' && <AdminTicketsContent />}
          {currentSection === 'movies' && <AdminMoviesContent />}
          {currentSection === 'genres' && <AdminGenresContent />}
          {currentSection === 'halls' && <AdminHallsContent />}
          {currentSection === 'seats' && <AdminSeatsContent />}
          {currentSection === 'showtimes' && <AdminShowtimesContent />}
          {currentSection === 'clients' && <AdminClientsContent />}
          {currentSection === 'reservations' && <AdminReservationsContent />}
          {currentSection === 'history' && <AdminHistoryContent />}
          {currentSection === 'admins' && <AdminAdminsContent />}
          
          {currentSection !== 'dashboard' && currentSection !== 'tickets' && currentSection !== 'movies' && currentSection !== 'genres' && currentSection !== 'halls' && currentSection !== 'seats' && currentSection !== 'showtimes' && currentSection !== 'clients' && currentSection !== 'reservations' && currentSection !== 'history' && currentSection !== 'admins' && (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[#1f1f27] rounded-xl text-gray-500">
              <span className="text-4xl mb-4">🚧</span>
              <p>Este módulo se encuentra en construcción.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  if (active) {
    return (
      <div onClick={onClick} className="flex items-center gap-3 px-4 py-3 mb-1 bg-[#fdd835] text-black rounded-lg font-bold cursor-pointer shadow-lg transition-transform hover:scale-105">
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
      </div>
    );
  }
  return (
    <div onClick={onClick} className="flex items-center gap-3 px-4 py-3 mb-1 text-gray-400 hover:bg-[#1a1a22] hover:text-white rounded-lg cursor-pointer transition-colors font-medium">
      <span className="text-lg grayscale opacity-70">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState({
    movies: 0,
    halls: 0,
    showtimes: 0,
    users: 0,
    reservations: 0,
    genres: 0
  });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/v1/movies/'),
      fetch('http://localhost:8000/api/v1/halls/'),
      fetch('http://localhost:8000/api/v1/showtimes/'),
      fetch('http://localhost:8000/api/v1/users/'),
      fetch('http://localhost:8000/api/v1/reservations/'),
      fetch('http://localhost:8000/api/v1/genres/')
    ])
    .then(async ([movRes, hallRes, showRes, userRes, resRes, genreRes]) => {
      setStats({
        movies: movRes.ok ? (await movRes.json()).length : 0,
        halls: hallRes.ok ? (await hallRes.json()).length : 0,
        showtimes: showRes.ok ? (await showRes.json()).length : 0,
        users: userRes.ok ? (await userRes.json()).length : 0,
        reservations: resRes.ok ? (await resRes.json()).length : 0,
        genres: genreRes.ok ? (await genreRes.json()).length : 0
      });
    })
    .catch(err => console.error("Error fetching dashboard stats:", err));
  }, []);

  const cards = [
    { title: 'PELÍCULAS ACTIVAS', icon: '🎬', color: 'bg-[#fdd835]', count: stats.movies },
    { title: 'SALAS DISPONIBLES', icon: '🪑', color: 'bg-[#fdd835]', count: stats.halls },
    { title: 'FUNCIONES PROGRAMADAS', icon: '⏱️', color: 'bg-[#fdd835]', count: stats.showtimes },
    { title: 'CLIENTES REGISTRADOS', icon: '👥', color: 'bg-[#fdd835]', count: stats.users },
    { title: 'RESERVAS ACTIVAS', icon: '🎫', color: 'bg-[#fdd835]', count: stats.reservations },
    { title: 'GÉNEROS', icon: '🏷️', color: 'bg-[#fdd835]', count: stats.genres },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-[#fdd835] mb-4 tracking-wide uppercase">Bienvenido al Panel</h2>
          <p className="text-gray-400 max-w-xl text-lg">Gestiona películas, salas, funciones, clientes y reservas desde un solo lugar de manera rápida y eficiente.</p>
        </div>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-9xl opacity-[0.03]">🎬</div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-8 hover:bg-[#1a1a22] hover:border-[#3a3a47] transition-all cursor-pointer group flex justify-between items-center">
            <div>
              <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110">{card.icon}</div>
              <div className={`w-8 h-1 ${card.color} mb-4 rounded-full opacity-80`}></div>
              <h3 className="text-xs font-bold text-gray-500 tracking-wider group-hover:text-white transition-colors uppercase">{card.title}</h3>
            </div>
            <div className="text-5xl font-black text-white">{card.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminMoviesContent() {
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('Todo Público');
  const [imageFile, setImageFile] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', duration_minutes: '', rating: '', genre_ids: [] });
  const [editImageFile, setEditImageFile] = useState(null);

  const fetchMoviesAndGenres = async () => {
    try {
      const [moviesRes, genresRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/movies/'),
        fetch('http://localhost:8000/api/v1/genres/')
      ]);
      
      if (moviesRes.ok) setMovies(await moviesRes.json());
      if (genresRes.ok) setAllGenres(await genresRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMoviesAndGenres();
  }, []);

  const handleGenreChange = (genreId, isEdit = false) => {
    if (isEdit) {
      setEditForm(prev => ({
        ...prev,
        genre_ids: prev.genre_ids.includes(genreId) 
          ? prev.genre_ids.filter(id => id !== genreId)
          : [...prev.genre_ids, genreId]
      }));
    } else {
      setSelectedGenres(prev => 
        prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
      );
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    const dur = parseInt(duration);
    if (dur < 15 || dur > 300) {
      setStatusMsg({ text: 'La duración debe ser entre 15 y 300 minutos.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: title,
        description: desc,
        duration_minutes: dur,
        rating: rating,
        genre_ids: selectedGenres
      };

      const response = await fetch('http://localhost:8000/api/v1/movies/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const createdMovie = await response.json();
        
        if (imageFile) {
          const formData = new FormData();
          formData.append('file', imageFile);
          await fetch(`http://localhost:8000/api/v1/movies/${createdMovie.id}/image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
        }
        
        setStatusMsg({ text: '¡Película agregada con éxito!', type: 'success' });
        setTitle('');
        setDesc('');
        setDuration('');
        setRating('Todo Público');
        setImageFile(null);
        setSelectedGenres([]);
        fetchMoviesAndGenres();
      } else {
        const errData = await response.json();
        setStatusMsg({ text: errData.detail || 'Error al agregar la película.', type: 'error' });
      }
    } catch (error) {
      setStatusMsg({ text: 'No se pudo conectar con el servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta película?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/movies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchMoviesAndGenres();
      } else {
        alert('Error al eliminar película');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (movie) => {
    setEditingId(movie.id);
    setEditImageFile(null);
    setEditForm({
      title: movie.title,
      description: movie.description,
      duration_minutes: movie.duration_minutes,
      rating: movie.rating,
      genre_ids: movie.genres ? movie.genres.map(g => g.id) : []
    });
  };

  const handleUpdateMovie = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/movies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editForm,
          duration_minutes: parseInt(editForm.duration_minutes)
        })
      });
      if (response.ok) {
        if (editImageFile) {
          const formData = new FormData();
          formData.append('file', editImageFile);
          await fetch(`http://localhost:8000/api/v1/movies/${id}/image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
        }
        setEditingId(null);
        setEditImageFile(null);
        fetchMoviesAndGenres();
      } else {
        alert('Error al actualizar película');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Columna Izquierda: Formulario */}
      <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-8 h-fit">
        <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-widest">Añadir Película</h3>
        
        {statusMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${statusMsg.type === 'success' ? 'bg-[#1a2e1e] text-[#4caf50] border border-[#2e5235]' : 'bg-[#2a1a1f] text-[#ff5252] border border-[#3a1a1f]'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleAddMovie} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Título de la Película</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Inception" 
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Descripción</label>
            <textarea 
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Sinopsis detallada..." 
              rows="4"
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835] resize-none"
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">Duración (minutos)</label>
              <input 
                type="number" 
                required
                min="15"
                max="300"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="15 - 300 min" 
                className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">Clasificación</label>
              <select 
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835] appearance-none"
              >
                <option value="Todo Público">Todo Público</option>
                <option value="Infantil">Infantil</option>
                <option value="+12">+12</option>
                <option value="+15">+15</option>
                <option value="+18">+18</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Géneros</label>
            <div className="flex flex-wrap gap-2">
              {allGenres.map(genre => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleGenreChange(genre.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${selectedGenres.includes(genre.id) ? 'bg-[#fdd835] text-black' : 'bg-[#1f1f27] text-gray-400 hover:bg-[#2a2a35] hover:text-white'}`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Póster (Opcional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full p-3 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fdd835] file:text-black hover:file:bg-[#fff04d]" />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-8 py-4 mt-4 rounded-xl font-bold bg-[#fdd835] text-black transition-all hover:bg-[#fff04d] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {loading ? 'Guardando...' : 'Guardar Película'}
          </button>
        </form>
      </div>

      {/* Columna Derecha: Lista de Películas */}
      <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-8">
        <div className="flex flex-col mb-6 gap-4">
          <h3 className="text-2xl font-bold text-white uppercase tracking-widest">Películas Registradas</h3>
          <input 
            type="text" 
            placeholder="Buscar por título o género..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835]"
          />
        </div>
        {movies.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-[#1f1f27] rounded-xl">
            <span className="text-4xl mb-4 block">🎬</span>
            <p>Aún no has agregado ninguna película.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {movies.filter(m => {
              const term = searchTerm.toLowerCase();
              const matchTitle = m.title.toLowerCase().includes(term);
              const matchGenre = m.genres && m.genres.some(g => g.name.toLowerCase().includes(term));
              return matchTitle || matchGenre;
            }).map(movie => (
              <div key={movie.id} className="p-5 border border-[#1f1f27] rounded-xl bg-[#0b0b0f] hover:border-[#fdd835]/50 transition-colors">
                {editingId === movie.id ? (
                  <div className="space-y-3">
                    <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full p-2 bg-[#121217] text-white rounded border border-[#fdd835]" />
                    <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full p-2 bg-[#121217] text-white rounded border border-[#fdd835] text-sm" rows="3" />
                    <div className="flex gap-2">
                      <input type="number" value={editForm.duration_minutes} onChange={e => setEditForm({...editForm, duration_minutes: e.target.value})} className="w-1/2 p-2 bg-[#121217] text-white rounded border border-[#fdd835]" />
                      <select value={editForm.rating} onChange={e => setEditForm({...editForm, rating: e.target.value})} className="w-1/2 p-2 bg-[#121217] text-white rounded border border-[#fdd835]">
                        <option value="Todo Público">Todo Público</option>
                        <option value="Infantil">Infantil</option>
                        <option value="+12">+12</option>
                        <option value="+15">+15</option>
                        <option value="+18">+18</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {allGenres.map(genre => (
                        <button
                          key={genre.id}
                          type="button"
                          onClick={() => handleGenreChange(genre.id, true)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${editForm.genre_ids.includes(genre.id) ? 'bg-[#fdd835] text-black' : 'bg-[#1f1f27] text-gray-400'}`}
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files[0])} className="w-full mt-2 p-2 bg-[#121217] text-white rounded border border-[#fdd835] text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#fdd835] file:text-black hover:file:bg-[#fff04d]" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleUpdateMovie(movie.id)} className="px-3 py-1 bg-[#fdd835] text-black font-bold rounded text-xs uppercase tracking-wider">Guardar</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-[#2a2a35] text-white font-bold rounded text-xs uppercase tracking-wider">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-[#fdd835]">{movie.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#fdd835]/10 text-[#fdd835] text-xs font-bold px-2 py-1 rounded border border-[#fdd835]/30">
                          {movie.rating}
                        </span>
                        <button onClick={() => startEdit(movie)} className="text-gray-400 hover:text-white transition-colors" title="Editar">✏️</button>
                        <button onClick={() => handleDeleteMovie(movie.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Eliminar">🗑️</button>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">{movie.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {movie.genres && movie.genres.map(g => (
                        <span key={g.id} className="bg-[#2a2a35] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                          {g.name}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-widest flex items-center gap-2">
                      <span>⏱️ {movie.duration_minutes} min</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminTicketsContent() {
  const [selectedMovie, setSelectedMovie] = useState(null);

  if (selectedMovie) {
    return (
      <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-8 relative overflow-hidden">
        <SeatSelector movie={selectedMovie} onBack={() => setSelectedMovie(null)} />
      </div>
    );
  }

  return (
    <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-8">
      <div className="flex justify-between items-center mb-8 border-b border-[#1f1f27] pb-6">
        <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Punto de Venta - Boletería</h3>
        <span className="bg-[#fdd835]/10 text-[#fdd835] px-4 py-2 rounded-lg text-sm font-bold tracking-widest border border-[#fdd835]/20">SELECCIONE FUNCIÓN</span>
      </div>
      <MovieGrid isAuthenticated={true} onBuyTickets={(movie) => setSelectedMovie(movie)} hideTitle={true} />
    </div>
  );
}

function AdminGenresContent() {
  const [genres, setGenres] = useState([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/genres/');
      if (res.ok) {
        const data = await res.json();
        setGenres(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGenre = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: name,
        description: desc
      };

      const response = await fetch('http://localhost:8000/api/v1/genres/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatusMsg({ text: '¡Género agregado con éxito!', type: 'success' });
        setName('');
        setDesc('');
        fetchGenres();
      } else {
        const errData = await response.json();
        setStatusMsg({ text: errData.detail || 'Error al agregar el género.', type: 'error' });
      }
    } catch (error) {
      setStatusMsg({ text: 'No se pudo conectar con el servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-8 h-fit">
        <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-widest">Añadir Género</h3>
        
        {statusMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${statusMsg.type === 'success' ? 'bg-[#1a2e1e] text-[#4caf50] border border-[#2e5235]' : 'bg-[#2a1a1f] text-[#ff5252] border border-[#3a1a1f]'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleAddGenre} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Nombre del Género</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Ciencia Ficción" 
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Descripción (Opcional)</label>
            <textarea 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Breve descripción..." 
              rows="3"
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835] resize-none"
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-8 py-4 mt-4 rounded-xl font-bold bg-[#fdd835] text-black transition-all hover:bg-[#fff04d] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {loading ? 'Guardando...' : 'Guardar Género'}
          </button>
        </form>
      </div>

      <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-8">
        <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-widest">Géneros Registrados</h3>
        {genres.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-[#1f1f27] rounded-xl">
            <span className="text-4xl mb-4 block">🏷️</span>
            <p>Aún no has agregado ningún género.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {genres.map(g => (
              <div key={g.id} className="p-4 border border-[#1f1f27] rounded-xl bg-[#0b0b0f] hover:border-[#fdd835]/50 transition-colors">
                <h4 className="text-lg font-bold text-[#fdd835]">{g.name}</h4>
                {g.description && <p className="text-gray-400 text-sm mt-1">{g.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminHallsContent() {
  const [halls, setHalls] = useState([]);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/halls/');
      if (res.ok) {
        const data = await res.json();
        setHalls(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHall = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    const cap = parseInt(capacity);
    if (cap < 10 || cap > 100) {
      setStatusMsg({ text: 'La capacidad debe ser entre 10 y 100 asientos.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: name,
        capacity: cap,
        is_active: true
      };

      const response = await fetch('http://localhost:8000/api/v1/halls/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatusMsg({ text: '¡Sala agregada con éxito!', type: 'success' });
        setName('');
        setCapacity('');
        fetchHalls();
      } else {
        const errData = await response.json();
        setStatusMsg({ text: errData.detail || 'Error al agregar la sala.', type: 'error' });
      }
    } catch (error) {
      setStatusMsg({ text: 'No se pudo conectar con el servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-8 h-fit">
        <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-widest">Añadir Sala</h3>
        
        {statusMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${statusMsg.type === 'success' ? 'bg-[#1a2e1e] text-[#4caf50] border border-[#2e5235]' : 'bg-[#2a1a1f] text-[#ff5252] border border-[#3a1a1f]'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleAddHall} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Nombre o Número de la Sala</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Sala 1 VIP" 
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Capacidad (Asientos)</label>
            <input 
              type="number"
              required
              min="10"
              max="100"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Ej. 80" 
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-8 py-4 mt-4 rounded-xl font-bold bg-[#fdd835] text-black transition-all hover:bg-[#fff04d] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {loading ? 'Guardando...' : 'Guardar Sala'}
          </button>
        </form>
      </div>

      <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-8">
        <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-widest">Salas Registradas</h3>
        {halls.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-[#1f1f27] rounded-xl">
            <span className="text-4xl mb-4 block">🪑</span>
            <p>Aún no has agregado ninguna sala.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {halls.map(h => (
              <div key={h.id} className="p-5 border border-[#1f1f27] rounded-xl bg-[#0b0b0f] hover:border-[#fdd835]/50 transition-colors flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-bold text-[#fdd835]">{h.name}</h4>
                  <p className="text-gray-400 text-sm mt-1">Capacidad: {h.capacity} asientos</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${h.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {h.is_active ? 'Activa' : 'Inactiva'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminSeatsContent() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState('');
  
  const [hallSeats, setHallSeats] = useState([]);
  const [occupiedSeatsData, setOccupiedSeatsData] = useState([]);

  // Tooltip state
  const [hoveredSeatInfo, setHoveredSeatInfo] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/v1/showtimes/'),
      fetch('http://localhost:8000/api/v1/movies/'),
      fetch('http://localhost:8000/api/v1/halls/')
    ])
    .then(async ([showRes, movRes, hallRes]) => {
      if (showRes.ok) setShowtimes(await showRes.json());
      if (movRes.ok) setMovies(await movRes.json());
      if (hallRes.ok) setHalls(await hallRes.json());
    })
    .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedShowtimeId) {
      const showtime = showtimes.find(s => s.id === parseInt(selectedShowtimeId));
      if (showtime) {
        Promise.all([
          fetch(`http://localhost:8000/api/v1/halls/${showtime.hall_id}/seats`),
          fetch(`http://localhost:8000/api/v1/reservations/showtime/${showtime.id}/full`)
        ])
        .then(async ([seatsRes, occRes]) => {
          if (seatsRes.ok) setHallSeats(await seatsRes.json());
          if (occRes.ok) setOccupiedSeatsData(await occRes.json());
        })
        .catch(err => console.error(err));
      }
    } else {
      setHallSeats([]);
      setOccupiedSeatsData([]);
    }
  }, [selectedShowtimeId, showtimes]);

  const getMovieTitle = (id) => movies.find(m => m.id === id)?.title || 'Película Desconocida';
  const getHallName = (id) => halls.find(h => h.id === id)?.name || 'Sala Desconocida';

  const selectedShowtime = showtimes.find(s => s.id === parseInt(selectedShowtimeId));

  const seatsByRow = hallSeats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const renderSeatMap = () => {
    if (!selectedShowtime) return null;

    return (
      <div className="mt-8 overflow-x-auto pb-8">
        <div className="min-w-max mx-auto">
          {/* Pantalla Screen */}
          <div className="w-3/4 mx-auto h-2 bg-gradient-to-b from-[#fdd835]/50 to-transparent rounded-t-[50%] mb-12 relative">
            <div className="absolute -top-6 w-full text-center text-[#fdd835] tracking-[0.5em] text-xs font-bold uppercase opacity-50">
              Pantalla
            </div>
            <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-[#fdd835]/10 to-transparent pointer-events-none"></div>
          </div>

          <div className="flex flex-col gap-4 items-center pb-4">
            {Object.keys(seatsByRow).sort().map(row => (
              <div key={row} className="flex gap-4 justify-center items-center">
                <span className="w-6 text-right font-bold text-[#fdd835]">{row}</span>
                <div className="flex gap-3">
                  {seatsByRow[row].sort((a,b) => a.number - b.number).map(seat => {
                    const occupiedInfo = occupiedSeatsData.find(o => o.seat_id === seat.id);
                    const isOccupied = !!occupiedInfo;
                    
                    let seatClass = "w-10 h-10 rounded-t-xl border-b-[5px] text-xs font-bold transition-all flex items-center justify-center ";
                    if (isOccupied) {
                      seatClass += "bg-[#2a1a1f] border-[#ff5252] text-[#ff5252] opacity-50 cursor-not-allowed";
                    } else {
                      seatClass += "bg-[#1f1f27] border-[#3a3a45] text-gray-400";
                    }

                    return (
                      <div
                        key={seat.id}
                        className={seatClass}
                        onMouseEnter={(e) => {
                          if (isOccupied) {
                            const rect = e.target.getBoundingClientRect();
                            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                            setHoveredSeatInfo(occupiedInfo);
                          }
                        }}
                        onMouseLeave={() => setHoveredSeatInfo(null)}
                      >
                        {seat.row}{seat.number}
                      </div>
                    );
                  })}
                </div>
                <span className="w-6 text-left font-bold text-[#fdd835]">{row}</span>
              </div>
            ))}
            {hallSeats.length === 0 && (
              <p className="text-gray-500 text-lg mt-8 border border-dashed border-[#1f1f27] p-8 rounded-xl">No hay asientos configurados para esta sala.</p>
            )}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-8 mt-12 pt-6 border-t border-[#1f1f27] text-sm text-gray-400 font-medium tracking-widest uppercase">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-[#1f1f27] border-b-[3px] border-[#3a3a45] rounded-t-sm"></div> Disponible
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-[#2a1a1f] border-b-[3px] border-[#ff5252] rounded-t-sm opacity-50"></div> Ocupado
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl p-8">
      <div className="flex justify-between items-center mb-8 border-b border-[#1f1f27] pb-6">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Mapa de Puestos</h3>
          <p className="text-gray-400 mt-2">Visualiza la disponibilidad de asientos por función</p>
        </div>
        <div className="w-96">
          <select 
            value={selectedShowtimeId}
            onChange={(e) => setSelectedShowtimeId(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:border-[#fdd835] focus:outline-none appearance-none"
          >
            <option value="">-- Seleccionar Función --</option>
            {showtimes.map(s => (
              <option key={s.id} value={s.id}>
                {getMovieTitle(s.movie_id)} - {getHallName(s.hall_id)} - {new Date(s.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedShowtime ? (
        <div className="bg-[#0b0b0f] border border-[#1f1f27] rounded-xl p-8 relative">
          {renderSeatMap()}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 border border-dashed border-[#1f1f27] rounded-xl">
          <span className="text-5xl mb-4 block">💺</span>
          <p className="text-lg">Selecciona una función del menú desplegable para ver su distribución de asientos.</p>
        </div>
      )}

      {/* Floating Tooltip */}
      {hoveredSeatInfo && (
        <div 
          className="fixed z-50 bg-[#fdd835] text-black p-4 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full w-64 border-2 border-black"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#fdd835] border-r-2 border-b-2 border-black transform rotate-45"></div>
          <h4 className="font-black uppercase tracking-widest text-sm border-b border-black/20 pb-2 mb-2">Reserva</h4>
          <p className="font-semibold text-sm mb-1"><span className="opacity-70 font-normal">Cliente:</span> {hoveredSeatInfo.user_name}</p>
          <p className="font-semibold text-sm"><span className="opacity-70 font-normal">Asientos:</span> {hoveredSeatInfo.all_seats}</p>
        </div>
      )}
    </div>
  );
}

function AdminShowtimesContent() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  
  const [movieId, setMovieId] = useState('');
  const [hallId, setHallId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [price, setPrice] = useState('');
  
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ movie_id: '', hall_id: '', start_time: '', price: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [showtimesRes, moviesRes, hallsRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/showtimes/'),
        fetch('http://localhost:8000/api/v1/movies/'),
        fetch('http://localhost:8000/api/v1/halls/')
      ]);
      
      if (showtimesRes.ok) setShowtimes(await showtimesRes.json());
      if (moviesRes.ok) setMovies(await moviesRes.json());
      if (hallsRes.ok) setHalls(await hallsRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddShowtime = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    if (!movieId || !hallId || !startTime || !price) {
      setStatusMsg({ text: 'Por favor, completa todos los campos.', type: 'error' });
      setLoading(false);
      return;
    }

    const startDate = new Date(startTime);
    if (startDate < new Date()) {
      setStatusMsg({ text: 'La fecha y hora de inicio no pueden ser en el pasado.', type: 'error' });
      setLoading(false);
      return;
    }

    const selectedMovie = movies.find(m => m.id === parseInt(movieId));
    if (!selectedMovie) {
      setStatusMsg({ text: 'Película no válida.', type: 'error' });
      setLoading(false);
      return;
    }

    const endDate = new Date(startDate.getTime() + (selectedMovie.duration_minutes * 60000));

    try {
      const token = localStorage.getItem('token');
      const payload = {
        movie_id: parseInt(movieId),
        hall_id: parseInt(hallId),
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        price: parseFloat(price),
        is_active: true
      };

      const response = await fetch('http://localhost:8000/api/v1/showtimes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatusMsg({ text: '¡Función programada con éxito!', type: 'success' });
        setMovieId('');
        setHallId('');
        setStartTime('');
        setPrice('');
        fetchData();
      } else {
        const errData = await response.json();
        setStatusMsg({ text: errData.detail || 'Error al agregar la función.', type: 'error' });
      }
    } catch (error) {
      setStatusMsg({ text: 'No se pudo conectar con el servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShowtime = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta función?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/showtimes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchData();
      } else {
        alert('Error al eliminar función');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (showtime) => {
    setEditingId(showtime.id);
    let st = '';
    if (showtime.start_time) {
        // Formatear a YYYY-MM-DDThh:mm local
        const d = new Date(showtime.start_time);
        st = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    setEditForm({
      movie_id: showtime.movie_id,
      hall_id: showtime.hall_id,
      start_time: st,
      price: showtime.price
    });
  };

  const handleUpdateShowtime = async (id) => {
    const selectedMovie = movies.find(m => m.id === parseInt(editForm.movie_id));
    if (!selectedMovie) {
        alert('Película no válida.');
        return;
    }
    const startDate = new Date(editForm.start_time);
    const endDate = new Date(startDate.getTime() + (selectedMovie.duration_minutes * 60000));
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        movie_id: parseInt(editForm.movie_id),
        hall_id: parseInt(editForm.hall_id),
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        price: parseFloat(editForm.price)
      };
      
      const response = await fetch(`http://localhost:8000/api/v1/showtimes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setEditingId(null);
        fetchData();
      } else {
        alert('Error al actualizar función');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 bg-[#121217] border border-[#1f1f27] rounded-2xl p-8 h-fit">
        <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-widest">Programar Función</h3>
        
        {statusMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${statusMsg.type === 'success' ? 'bg-[#1a2e1e] text-[#4caf50] border border-[#2e5235]' : 'bg-[#2a1a1f] text-[#ff5252] border border-[#3a1a1f]'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleAddShowtime} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Película</label>
            <select 
              value={movieId}
              onChange={(e) => setMovieId(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835] appearance-none"
            >
              <option value="">Seleccionar Película</option>
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Sala</label>
            <select 
              value={hallId}
              onChange={(e) => setHallId(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835] appearance-none"
            >
              <option value="">Seleccionar Sala</option>
              {halls.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Inicio</label>
            <input 
              type="datetime-local" 
              value={startTime}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Precio de Entrada ($)</label>
            <input 
              type="number" 
              step="0.01"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ej. 5.50"
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-8 py-4 mt-4 rounded-xl font-bold bg-[#fdd835] text-black transition-all hover:bg-[#fff04d] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {loading ? 'Guardando...' : 'Guardar Función'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-8 bg-[#121217] border border-[#1f1f27] rounded-2xl p-8">
        <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-widest">Funciones Programadas</h3>
        {showtimes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-[#1f1f27] rounded-xl">
            <span className="text-4xl mb-4 block">📅</span>
            <p>Aún no has programado ninguna función.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showtimes.map(s => {
              const movie = movies.find(m => m.id === s.movie_id);
              const hall = halls.find(h => h.id === s.hall_id);
              return (
                <div key={s.id} className="p-5 border border-[#1f1f27] rounded-xl bg-[#0b0b0f] hover:border-[#fdd835]/50 transition-colors relative group">
                  {editingId === s.id ? (
                    <div className="space-y-3">
                      <select value={editForm.movie_id} onChange={e => setEditForm({...editForm, movie_id: e.target.value})} className="w-full p-2 bg-[#121217] text-white rounded border border-[#fdd835]">
                        <option value="">Seleccionar Película</option>
                        {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                      </select>
                      <select value={editForm.hall_id} onChange={e => setEditForm({...editForm, hall_id: e.target.value})} className="w-full p-2 bg-[#121217] text-white rounded border border-[#fdd835]">
                        <option value="">Seleccionar Sala</option>
                        {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                      <input type="datetime-local" value={editForm.start_time} onChange={e => setEditForm({...editForm, start_time: e.target.value})} className="w-full p-2 bg-[#121217] text-white rounded border border-[#fdd835]" />
                      <input type="number" step="0.01" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full p-2 bg-[#121217] text-white rounded border border-[#fdd835]" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleUpdateShowtime(s.id)} className="px-3 py-1 bg-[#fdd835] text-black font-bold rounded text-xs uppercase tracking-wider">Guardar</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-[#2a2a35] text-white font-bold rounded text-xs uppercase tracking-wider">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0b0b0f] p-1 rounded-md">
                        <button onClick={() => startEdit(s)} className="text-gray-400 hover:text-white transition-colors" title="Editar">✏️</button>
                        <button onClick={() => handleDeleteShowtime(s.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Eliminar">🗑️</button>
                      </div>
                      <div className="flex justify-between items-start mb-4 pr-12">
                        <h4 className="text-xl font-black text-[#fdd835]">{movie ? movie.title : 'Desconocida'}</h4>
                        <span className="bg-[#1f1f27] text-white px-3 py-1 rounded-lg text-sm font-bold">${s.price.toFixed(2)}</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <span>🪑</span> <span className="font-semibold text-white">{hall ? hall.name : 'Desconocida'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🟢</span> <span>Inicio: {new Date(s.start_time).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🔴</span> <span>Fin: {new Date(s.end_time).toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminClientsContent() {
  const [clients, setClients] = useState([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    fetch('http://localhost:8000/api/v1/users/')
      .then(res => res.json())
      .then(data => setClients(data.filter(user => user.role === 'cliente')))
      .catch(err => console.error(err));
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,}$/;
    if (!nameRegex.test(fullName.trim())) {
      setStatusMsg({ text: 'El nombre solo puede contener letras y al menos 2 caracteres.', type: 'error' });
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatusMsg({ text: 'Por favor ingresa un correo electrónico válido.', type: 'error' });
      setLoading(false);
      return;
    }
    if (phone && !/^\+?[0-9]{7,15}$/.test(phone.trim())) {
      setStatusMsg({ text: 'El teléfono debe tener 7-15 dígitos, puede iniciar con +.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = { full_name: fullName, phone, email, password };

      const response = await fetch('http://localhost:8000/api/v1/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatusMsg({ text: '¡Cliente agregado con éxito!', type: 'success' });
        setFullName('');
        setPhone('');
        setEmail('');
        setPassword('');
        fetchClients();
      } else {
        const errData = await response.json();
        setStatusMsg({ text: errData.detail || 'Error al registrar cliente.', type: 'error' });
      }
    } catch (error) {
      setStatusMsg({ text: 'No se pudo conectar con el servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 bg-[#121217] border border-[#1f1f27] rounded-2xl p-8 h-fit">
        <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-widest">Añadir Cliente</h3>
        
        {statusMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${statusMsg.type === 'success' ? 'bg-[#1a2e1e] text-[#4caf50] border border-[#2e5235]' : 'bg-[#2a1a1f] text-[#ff5252] border border-[#3a1a1f]'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleAddClient} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Nombre Completo</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Juan Pérez" 
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Teléfono</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890" 
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Correo</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com" 
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Contraseña (Min 6)</label>
            <input 
              type="password" 
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white transition-colors focus:outline-none focus:border-[#fdd835]"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-8 py-4 mt-4 rounded-xl font-bold bg-[#fdd835] text-black transition-all hover:bg-[#fff04d] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {loading ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-8 bg-[#121217] border border-[#1f1f27] rounded-2xl p-8">
      <div className="flex justify-between items-center mb-8 border-b border-[#1f1f27] pb-6">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Base de Clientes</h3>
          <p className="text-gray-400 mt-2">Gestión de usuarios registrados en la plataforma</p>
        </div>
        <div className="bg-[#fdd835]/10 text-[#fdd835] px-4 py-2 rounded-lg text-sm font-bold tracking-widest border border-[#fdd835]/20">
          TOTAL: {clients.length}
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-[#1f1f27] rounded-xl">
          <span className="text-5xl mb-4 block">👥</span>
          <p className="text-lg">No hay clientes registrados en el sistema.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1f1f27] text-gray-500 text-xs tracking-widest uppercase">
                <th className="p-4 font-bold">Nombre Completo</th>
                <th className="p-4 font-bold">Correo Electrónico</th>
                <th className="p-4 font-bold">Teléfono</th>
                <th className="p-4 font-bold">Rol</th>
                <th className="p-4 font-bold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className="border-b border-[#1f1f27] hover:bg-[#0b0b0f] transition-colors">
                  <td className="p-4 font-semibold text-white">{client.full_name || 'Sin nombre'}</td>
                  <td className="p-4 text-gray-400">{client.email}</td>
                  <td className="p-4 text-gray-400">{client.phone || 'No registrado'}</td>
                  <td className="p-4 text-gray-400 uppercase text-xs tracking-widest">{client.role}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${client.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {client.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}

function AdminReservationsContent() {
  const [reservations, setReservations] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [clients, setClients] = useState([]);

  const [userId, setUserId] = useState('');
  const [showtimeId, setShowtimeId] = useState('');
  const [hallSeats, setHallSeats] = useState([]);
  const [occupiedSeatsData, setOccupiedSeatsData] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  
  // Quick Client Creation
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [creatingClientLoading, setCreatingClientLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Tooltip state
  const [hoveredSeatInfo, setHoveredSeatInfo] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRes, showRes, movRes, cliRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/reservations/'),
        fetch('http://localhost:8000/api/v1/showtimes/'),
        fetch('http://localhost:8000/api/v1/movies/'),
        fetch('http://localhost:8000/api/v1/users/')
      ]);
      
      if (resRes.ok) setReservations(await resRes.json());
      if (showRes.ok) setShowtimes(await showRes.json());
      if (movRes.ok) setMovies(await movRes.json());
      if (cliRes.ok) setClients(await cliRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showtimeId) {
      const showtime = showtimes.find(s => s.id === parseInt(showtimeId));
      if (showtime) {
        // Fetch seats for the hall and occupied seats for the showtime
        Promise.all([
          fetch(`http://localhost:8000/api/v1/halls/${showtime.hall_id}/seats`),
          fetch(`http://localhost:8000/api/v1/reservations/showtime/${showtime.id}/full`)
        ])
        .then(async ([seatsRes, occRes]) => {
          if (seatsRes.ok) setHallSeats(await seatsRes.json());
          if (occRes.ok) setOccupiedSeatsData(await occRes.json());
          setSelectedSeatIds([]); // Reset selection when changing showtime
        })
        .catch(err => console.error(err));
      }
    } else {
      setHallSeats([]);
      setOccupiedSeatsData([]);
      setSelectedSeatIds([]);
    }
  }, [showtimeId, showtimes]);

  const toggleSeat = (seatId) => {
    if (occupiedSeatsData.some(o => o.seat_id === seatId)) return;
    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seatId));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seatId]);
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    if (!userId || !showtimeId || selectedSeatIds.length === 0) {
      setStatusMsg({ text: 'Selecciona cliente, función y al menos un asiento.', type: 'error' });
      setLoading(false);
      return;
    }

    const showtime = showtimes.find(s => s.id === parseInt(showtimeId));
    const totalPrice = selectedSeatIds.length * showtime.price;

    try {
      const token = localStorage.getItem('token');
      const payload = {
        user_id: parseInt(userId),
        showtime_id: parseInt(showtimeId),
        total_price: totalPrice,
        status: 'active',
        seat_ids: selectedSeatIds
      };

      const response = await fetch('http://localhost:8000/api/v1/reservations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatusMsg({ text: '¡Reserva creada exitosamente!', type: 'success' });
        setUserId('');
        setShowtimeId('');
        setSelectedSeatIds([]);
        fetchData();
      } else {
        const errData = await response.json();
        setStatusMsg({ text: errData.detail || 'Error al crear la reserva.', type: 'error' });
      }
    } catch (error) {
      setStatusMsg({ text: 'Error de conexión.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) {
        setStatusMsg({ text: 'Nombre y correo son obligatorios.', type: 'error' });
        return;
    }
    setCreatingClientLoading(true);
    setStatusMsg({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          full_name: newClientName,
          email: newClientEmail,
          phone: newClientPhone,
          password: 'defaultPassword123'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setClients([...clients, data]);
        setUserId(data.id);
        setIsCreatingClient(false);
        setNewClientName('');
        setNewClientEmail('');
        setNewClientPhone('');
        setStatusMsg({ text: 'Cliente creado exitosamente.', type: 'success' });
      } else {
        const err = await response.json();
        setStatusMsg({ text: err.detail || 'Error al crear cliente', type: 'error' });
      }
    } catch (err) {
      setStatusMsg({ text: 'Error de conexión', type: 'error' });
    } finally {
      setCreatingClientLoading(false);
    }
  };

  // Group seats by row for rendering
  const seatsByRow = hallSeats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Columna Izquierda: Formulario de Nueva Reserva */}
      <div className="lg:col-span-4 bg-[#121217] border border-[#1f1f27] rounded-2xl p-8 h-fit">
        <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-widest">Nueva Reserva</h3>
        
        {statusMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${statusMsg.type === 'success' ? 'bg-[#1a2e1e] text-[#4caf50] border border-[#2e5235]' : 'bg-[#2a1a1f] text-[#ff5252] border border-[#3a1a1f]'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleCreateReservation} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-400 text-sm font-semibold">Cliente</label>
              <button type="button" onClick={() => setIsCreatingClient(!isCreatingClient)} className="text-[#fdd835] text-xs font-bold hover:underline">
                {isCreatingClient ? 'Cancelar' : '+ Nuevo Cliente'}
              </button>
            </div>
            
            {isCreatingClient ? (
              <div className="space-y-3 p-4 bg-[#0b0b0f] border border-[#fdd835]/30 rounded-xl">
                <input type="text" placeholder="Nombre Completo" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full p-3 rounded-lg bg-[#121217] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835]" />
                <input type="email" placeholder="Correo Electrónico" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="w-full p-3 rounded-lg bg-[#121217] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835]" />
                <input type="text" placeholder="Teléfono" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="w-full p-3 rounded-lg bg-[#121217] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835]" />
                <button type="button" onClick={handleCreateClient} disabled={creatingClientLoading} className="w-full py-3 bg-[#fdd835] text-black font-bold rounded-lg uppercase tracking-wider text-sm transition-all hover:bg-[#fff04d]">
                  {creatingClientLoading ? 'Guardando...' : 'Guardar y Seleccionar'}
                </button>
              </div>
            ) : (
              <select 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835] appearance-none"
              >
                <option value="">Seleccionar Cliente</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Función</label>
            <select 
              value={showtimeId}
              onChange={(e) => setShowtimeId(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835] appearance-none"
            >
              <option value="">Seleccionar Función</option>
              {showtimes.map(s => {
                const movie = movies.find(m => m.id === s.movie_id);
                return (
                  <option key={s.id} value={s.id}>
                    {movie ? movie.title : 'Desconocida'} - {new Date(s.start_time).toLocaleString()}
                  </option>
                );
              })}
            </select>
          </div>

          {showtimeId && (
            <div className="mt-6">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(true)}
                className="w-full px-6 py-4 border-2 border-dashed border-[#fdd835] text-[#fdd835] font-bold rounded-xl transition-all hover:bg-[#fdd835]/10 flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                <span>💺</span> Abrir Mapa de Asientos
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-[#0b0b0f] border border-[#1f1f27] rounded-xl">
            <div className="flex justify-between items-center text-gray-400 text-sm mb-1">
              <span>Asientos seleccionados:</span>
              <span className="text-white font-bold">{selectedSeatIds.length}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#1f1f27]">
              <span className="text-lg font-bold text-white uppercase">Total a Pagar:</span>
              <span className="text-2xl font-black text-[#fdd835]">
                ${(selectedSeatIds.length * (showtimes.find(s => s.id === parseInt(showtimeId))?.price || 0)).toFixed(2)}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || selectedSeatIds.length === 0}
            className="w-full px-8 py-4 mt-4 rounded-xl font-bold bg-[#fdd835] text-black transition-all hover:bg-[#fff04d] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 uppercase tracking-widest"
          >
            {loading ? 'Procesando...' : 'Confirmar Reserva'}
          </button>
        </form>
      </div>

      {/* Modal de Asientos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Header del Modal */}
            <div className="flex justify-between items-center p-6 border-b border-[#1f1f27] bg-[#0b0b0f]">
              <h3 className="text-2xl font-bold text-white tracking-widest uppercase">
                Selección de Asientos
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {/* Contenido del Mapa */}
            <div className="p-8 overflow-y-auto flex-1">
              <div className="w-3/4 mx-auto h-8 border-t-4 border-b border-b-transparent border-[#fdd835] opacity-80 rounded-[50%] mb-16 shadow-[0_-10px_30px_rgba(253,216,53,0.15)] relative">
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-[#fdd835] font-bold tracking-[0.5em] uppercase">Pantalla</span>
              </div>

              <div className="flex flex-col gap-4 items-center pb-4">
                {Object.keys(seatsByRow).sort().map(row => (
                  <div key={row} className="flex gap-4 justify-center items-center">
                    <span className="w-6 text-right font-bold text-[#fdd835]">{row}</span>
                    <div className="flex gap-3">
                      {seatsByRow[row].sort((a,b) => a.number - b.number).map(seat => {
                        const occupiedInfo = occupiedSeatsData.find(o => o.seat_id === seat.id);
                        const isOccupied = !!occupiedInfo;
                        const isSelected = selectedSeatIds.includes(seat.id);
                        
                        let seatClass = "w-10 h-10 rounded-t-xl border-b-[5px] text-xs font-bold transition-all flex items-center justify-center cursor-pointer ";
                        if (isOccupied) {
                          seatClass += "bg-[#2a1a1f] border-[#ff5252] text-[#ff5252] opacity-50 cursor-not-allowed";
                        } else if (isSelected) {
                          seatClass += "bg-[#fdd835] border-[#b29525] text-black scale-110 shadow-[0_0_20px_rgba(253,216,53,0.5)]";
                        } else {
                          seatClass += "bg-[#1f1f27] border-[#3a3a45] text-gray-400 hover:bg-[#2a2a35] hover:border-[#4a4a55] hover:-translate-y-1";
                        }

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => toggleSeat(seat.id)}
                            disabled={isOccupied}
                            className={seatClass}
                            onMouseEnter={(e) => {
                              if (isOccupied) {
                                const rect = e.target.getBoundingClientRect();
                                setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                                setHoveredSeatInfo(occupiedInfo);
                              }
                            }}
                            onMouseLeave={() => setHoveredSeatInfo(null)}
                          >
                            {seat.row}{seat.number}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-6 text-left font-bold text-[#fdd835]">{row}</span>
                  </div>
                ))}
                {hallSeats.length === 0 && (
                  <p className="text-gray-500 text-lg mt-8 border border-dashed border-[#1f1f27] p-8 rounded-xl">No hay asientos configurados para esta sala.</p>
                )}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-8 mt-12 pt-6 border-t border-[#1f1f27] text-sm text-gray-400 font-medium tracking-widest uppercase">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#1f1f27] border-b-[3px] border-[#3a3a45] rounded-t-sm"></div> Disponible
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#fdd835] border-b-[3px] border-[#b29525] rounded-t-sm"></div> Seleccionado
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#2a1a1f] border-b-[3px] border-[#ff5252] rounded-t-sm opacity-50"></div> Ocupado
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-6 border-t border-[#1f1f27] bg-[#0b0b0f] flex justify-between items-center">
              <div className="text-gray-400">
                Seleccionados: <span className="text-white font-bold text-xl ml-2">{selectedSeatIds.length}</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 bg-[#fdd835] text-black font-bold rounded-xl uppercase tracking-widest transition-all hover:bg-[#fff04d]"
              >
                Aceptar y Volver
              </button>
            </div>
            
            {/* Floating Tooltip */}
            {hoveredSeatInfo && (
              <div 
                className="fixed z-50 bg-[#fdd835] text-black p-4 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full w-64 border-2 border-black"
                style={{ left: tooltipPos.x, top: tooltipPos.y }}
              >
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#fdd835] border-r-2 border-b-2 border-black transform rotate-45"></div>
                <h4 className="font-black uppercase tracking-widest text-sm border-b border-black/20 pb-2 mb-2">Reserva</h4>
                <p className="font-semibold text-sm mb-1"><span className="opacity-70 font-normal">Cliente:</span> {hoveredSeatInfo.user_name}</p>
                <p className="font-semibold text-sm"><span className="opacity-70 font-normal">Asientos:</span> {hoveredSeatInfo.all_seats}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Columna Derecha: Lista de Reservas */}
      <div className="lg:col-span-8 bg-[#121217] border border-[#1f1f27] rounded-2xl p-8">
        <div className="flex justify-between items-center mb-8 border-b border-[#1f1f27] pb-6">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Registro de Reservas</h3>
            <p className="text-gray-400 mt-2">Historial de boletos vendidos y reservas activas</p>
          </div>
          <div className="bg-[#fdd835]/10 text-[#fdd835] px-4 py-2 rounded-lg text-sm font-bold tracking-widest border border-[#fdd835]/20">
            TOTAL: {reservations.length}
          </div>
        </div>

        {reservations.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border border-dashed border-[#1f1f27] rounded-xl">
            <span className="text-5xl mb-4 block">🎫</span>
            <p className="text-lg">No hay reservas registradas en el sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1f1f27] text-gray-500 text-xs tracking-widest uppercase">
                  <th className="p-4 font-bold">ID Reserva</th>
                  <th className="p-4 font-bold">Cliente</th>
                  <th className="p-4 font-bold">Película (Función)</th>
                  <th className="p-4 font-bold">Fecha de Compra</th>
                  <th className="p-4 font-bold">Total Pagado</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => {
                  const client = clients.find(c => c.id === res.user_id);
                  const showtime = showtimes.find(s => s.id === res.showtime_id);
                  const movie = showtime ? movies.find(m => m.id === showtime.movie_id) : null;
                  
                  return (
                    <tr key={res.id} className="border-b border-[#1f1f27] hover:bg-[#0b0b0f] transition-colors">
                      <td className="p-4 font-bold text-[#fdd835]">#{res.id}</td>
                      <td className="p-4 font-semibold text-white">{client ? client.full_name || client.email : 'Usuario Desconocido'}</td>
                      <td className="p-4 text-gray-400">
                        <div className="font-bold text-white">{movie ? movie.title : 'Película Desconocida'}</div>
                        <div className="text-xs">Inicio: {showtime ? new Date(showtime.start_time).toLocaleString() : 'N/A'}</div>
                      </td>
                      <td className="p-4 text-gray-400">{new Date(res.created_at).toLocaleString()}</td>
                      <td className="p-4 font-black text-[#fdd835]">${res.total_price.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${res.status === 'completed' || res.status === 'pending' || res.status === 'active' ? 'bg-[#fdd835]/20 text-[#fdd835] border border-[#fdd835]/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            try {
                              const doc = new jsPDF();
                              const yellow = [253, 216, 53];
                              const dark = [18, 18, 23];
                              
                              // Fondo principal (blanco para factura formal)
                              doc.setFillColor(255, 255, 255);
                              doc.rect(0, 0, 210, 297, 'F');

                              // --- ENCABEZADO ---
                              // Logo "CINE"
                              doc.setFillColor(...dark);
                              doc.rect(14, 15, 40, 20, 'F');
                              doc.setTextColor(...yellow);
                              doc.setFontSize(22);
                              doc.setFont('helvetica', 'bold');
                              doc.text('CINE', 34, 29, { align: 'center' });

                              // Datos de la Empresa
                              doc.setTextColor(0, 0, 0);
                              doc.setFontSize(9);
                              doc.setFont('helvetica', 'bold');
                              doc.text('Razón Social:', 65, 19);
                              doc.text('RFC:', 65, 24);
                              doc.text('Domicilio:', 65, 29);
                              
                              doc.setFont('helvetica', 'normal');
                              doc.text('CINE ENTRETENIMIENTO S.A. DE C.V.', 95, 19);
                              doc.text('CINE123456789', 95, 24);
                              const domicilio = 'AV. PRINCIPAL 123, CENTRO. CIUDAD, PAÍS. CP 00000';
                              doc.text(domicilio, 95, 29, { maxWidth: 60 });

                              // Cuadro de Factura
                              doc.setFillColor(...dark);
                              doc.rect(160, 15, 36, 6, 'F');
                              doc.setTextColor(...yellow);
                              doc.setFontSize(9);
                              doc.setFont('helvetica', 'bold');
                              doc.text('FACTURA', 178, 19, { align: 'center' });
                              
                              doc.setDrawColor(...dark);
                              doc.rect(160, 21, 36, 6);
                              doc.setTextColor(0, 0, 0);
                              doc.text(`F-${(res.id || 0).toString().padStart(6, '0')}`, 178, 25, { align: 'center' });

                              // --- DATOS DEL CLIENTE Y FECHA ---
                              doc.setFillColor(...dark);
                              doc.rect(14, 45, 90, 5, 'F');
                              doc.rect(106, 45, 90, 5, 'F');
                              
                              doc.setTextColor(...yellow);
                              doc.setFontSize(9);
                              doc.setFont('helvetica', 'bold');
                              doc.text('Cliente', 16, 49);
                              doc.text('Fecha / Hora', 108, 49);

                              doc.setTextColor(0, 0, 0);
                              doc.setFont('helvetica', 'bold');
                              const clientName = (client && (client.full_name || client.email)) ? (client.full_name || client.email) : 'MOSTRADOR';
                              doc.text(String(clientName).toUpperCase(), 16, 55);
                              doc.setFont('helvetica', 'normal');
                              if (client && client.email) doc.text(String(client.email), 16, 60);
                              if (client && client.phone) doc.text(`Tel: ${client.phone}`, 16, 65);

                              const dateStr = res.created_at ? new Date(res.created_at).toLocaleString() : 'N/A';
                              doc.text(dateStr, 108, 55);

                              // --- TABLA DE CONCEPTOS ---
                              const showPrice = showtime ? (showtime.price || 0) : 0;
                              const totalPrice = res.total_price || 0;
                              let cantidad = 1;
                              if (showPrice > 0) {
                                cantidad = Math.round(totalPrice / showPrice);
                              }

                              const subtotal = totalPrice / 1.16;
                              const iva = totalPrice - subtotal;
                              const movieTitle = (movie && movie.title) ? movie.title : 'PELÍCULA';

                              autoTable(doc, {
                                startY: 75,
                                head: [['Cantidad', 'Concepto', 'Unidad', 'Precio Unitario', 'Importe']],
                                body: [
                                  [
                                    cantidad.toString(),
                                    `Boleto Función: ${String(movieTitle).toUpperCase()}`,
                                    'NO APLICA',
                                    `$${showPrice > 0 ? (showPrice / 1.16).toFixed(2) : subtotal.toFixed(2)}`,
                                    `$${subtotal.toFixed(2)}`
                                  ]
                                ],
                                theme: 'plain',
                                headStyles: { textColor: [100, 100, 100], fontStyle: 'italic', fontSize: 9 },
                                bodyStyles: { textColor: [0, 0, 0], fontSize: 9, fontStyle: 'bold' },
                                columnStyles: {
                                  0: { cellWidth: 20 },
                                  1: { cellWidth: 70 },
                                  2: { cellWidth: 30 },
                                  3: { cellWidth: 30 },
                                  4: { cellWidth: 30 }
                                },
                                didDrawPage: function (data) {
                                  doc.setDrawColor(...dark);
                                  doc.setLineWidth(0.5);
                                  doc.line(14, data.cursor.y, 196, data.cursor.y);
                                }
                              });

                              const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 5 : 100;

                              // --- DATOS ADDENDA ---
                              doc.setFontSize(9);
                              doc.setFont('helvetica', 'bold');
                              doc.text('Datos adición', 14, finalY + 5);
                              
                              doc.setFont('helvetica', 'normal');
                              doc.text('Función:', 20, finalY + 10);
                              doc.text(showtime ? new Date(showtime.start_time).toLocaleString() : 'N/A', 50, finalY + 10);
                              doc.text('Estado:', 20, finalY + 15);
                              const resStatus = res.status || 'ACTIVE';
                              doc.text(String(resStatus).toUpperCase(), 50, finalY + 15);

                              // --- TOTALES ---
                              doc.setFont('helvetica', 'bold');
                              doc.text('Subtotal', 140, finalY + 10);
                              doc.text('IVA 16%', 140, finalY + 15);
                              doc.text('TOTAL', 140, finalY + 22);

                              doc.setFont('helvetica', 'normal');
                              doc.text(`$${subtotal.toFixed(2)}`, 196, finalY + 10, { align: 'right' });
                              doc.text(`$${iva.toFixed(2)}`, 196, finalY + 15, { align: 'right' });
                              doc.setFont('helvetica', 'bold');
                              doc.text(`$${totalPrice.toFixed(2)}`, 196, finalY + 22, { align: 'right' });

                              // --- PIE DE PÁGINA ---
                              doc.setFillColor(...dark);
                              doc.rect(14, finalY + 30, 80, 5, 'F');
                              doc.setTextColor(...yellow);
                              doc.setFontSize(9);
                              doc.text('Importe con letra', 16, finalY + 34);

                              doc.setTextColor(0, 0, 0);
                              doc.setFont('helvetica', 'normal');
                              doc.text(`SON: (IMPORTE SIMULADO) M.N.`, 14, finalY + 42);
                              doc.text('Moneda:   Peso Mexicano (MXN)', 14, finalY + 48);

                              doc.setFillColor(...dark);
                              doc.rect(14, finalY + 55, 100, 5, 'F');
                              doc.setTextColor(...yellow);
                              doc.text('Cadena Original del Complemento de Certificación', 16, finalY + 59);

                              doc.save(`Factura_Reserva_${res.id || 'N'}.pdf`);
                            } catch (err) {
                              console.error("Error generating PDF:", err);
                              alert("No se pudo descargar el PDF: " + err.message);
                            }
                          }}
                          className="px-3 py-1 bg-[#fdd835] text-black font-bold rounded hover:bg-[#fff04d] transition-colors text-xs uppercase tracking-widest"
                          title="Descargar Boleto"
                        >
                          ⬇️ PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminAdminsContent() {
  const [admins, setAdmins] = useState([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    fetch('http://localhost:8000/api/v1/users/')
      .then(res => res.json())
      .then(data => setAdmins(data.filter(u => u.role === 'admin')))
      .catch(err => console.error(err));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    // --- Validaciones ---
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,}$/;
    if (!nameRegex.test(fullName.trim())) {
      setStatusMsg({ text: 'El nombre solo puede contener letras y al menos 2 caracteres.', type: 'error' });
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatusMsg({ text: 'Por favor ingresa un correo electrónico válido.', type: 'error' });
      setLoading(false);
      return;
    }
    if (phone && !/^\+?[0-9]{7,15}$/.test(phone.trim())) {
      setStatusMsg({ text: 'El teléfono debe contener solo números (7-15 dígitos), puede iniciar con +.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Use the public /auth/register route which forces role=admin
      const payload = { full_name: fullName, phone, email, password };

      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatusMsg({ text: '¡Administrador registrado con éxito!', type: 'success' });
        setFullName(''); setPhone(''); setEmail(''); setPassword('');
        fetchAdmins();
      } else {
        const errData = await response.json();
        setStatusMsg({ text: errData.detail || 'Error al registrar administrador.', type: 'error' });
      }
    } catch (error) {
      setStatusMsg({ text: 'No se pudo conectar con el servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 bg-[#121217] border border-[#1f1f27] rounded-2xl p-8 h-fit">
        <h3 className="text-2xl font-bold mb-2 text-white uppercase tracking-widest">Nuevo Admin</h3>
        <p className="text-gray-500 text-sm mb-6">Los administradores tienen acceso total al panel.</p>
        
        {statusMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${statusMsg.type === 'success' ? 'bg-[#1a2e1e] text-[#4caf50] border border-[#2e5235]' : 'bg-[#2a1a1f] text-[#ff5252] border border-[#3a1a1f]'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Nombre Completo</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Carlos López"
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835]" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Teléfono</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835]" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Correo</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cine.com"
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835]" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Contraseña (Min 6)</label>
            <input type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 rounded-xl bg-[#0b0b0f] border border-[#1f1f27] text-white focus:outline-none focus:border-[#fdd835]" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full px-8 py-4 mt-4 rounded-xl font-bold bg-[#fdd835] text-black transition-all hover:bg-[#fff04d] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest">
            {loading ? 'Registrando...' : 'Registrar Administrador'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-8 bg-[#121217] border border-[#1f1f27] rounded-2xl p-8">
        <div className="flex justify-between items-center mb-8 border-b border-[#1f1f27] pb-6">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Administradores</h3>
            <p className="text-gray-400 mt-2">Personal con acceso completo al sistema</p>
          </div>
          <div className="bg-[#fdd835]/10 text-[#fdd835] px-4 py-2 rounded-lg text-sm font-bold tracking-widest border border-[#fdd835]/20">
            TOTAL: {admins.length}
          </div>
        </div>

        {admins.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border border-dashed border-[#1f1f27] rounded-xl">
            <span className="text-5xl mb-4 block">🛡️</span>
            <p className="text-lg">No hay administradores registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1f1f27] text-gray-500 text-xs tracking-widest uppercase">
                  <th className="p-4 font-bold">Nombre</th>
                  <th className="p-4 font-bold">Correo</th>
                  <th className="p-4 font-bold">Teléfono</th>
                  <th className="p-4 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id} className="border-b border-[#1f1f27] hover:bg-[#0b0b0f] transition-colors">
                    <td className="p-4 font-semibold text-white">{admin.full_name || 'Sin nombre'}</td>
                    <td className="p-4 text-gray-400">{admin.email}</td>
                    <td className="p-4 text-gray-400">{admin.phone || 'No registrado'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${admin.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {admin.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminHistoryContent() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/reservations/history/all')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredHistory = history.filter(record => {
    const matchesText = record.movie_title.toLowerCase().includes(filterText.toLowerCase()) ||
                        record.user_name.toLowerCase().includes(filterText.toLowerCase()) ||
                        record.user_email.toLowerCase().includes(filterText.toLowerCase());
    
    if (!matchesText) return false;

    if (timeRange === 'all') return true;

    const recordDate = new Date(record.created_at || record.showtime_start);
    const now = new Date();
    
    if (timeRange === 'today') {
      return recordDate.toDateString() === now.toDateString();
    }
    if (timeRange === 'this_week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      return recordDate >= startOfWeek && recordDate <= new Date();
    }
    if (timeRange === 'this_month') {
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
    }
    if (timeRange === 'last_month') {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return recordDate.getMonth() === lastMonth && recordDate.getFullYear() === year;
    }
    if (timeRange === 'this_year') {
      return recordDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  const totalRevenue = filteredHistory.reduce((sum, record) => sum + (record.status === 'active' ? record.total_price : 0), 0);
  const totalTickets = filteredHistory.reduce((sum, record) => sum + (record.status === 'active' && record.seats !== 'Ninguno' ? record.seats.split(',').length : 0), 0);
  const distinctShowtimes = new Set(filteredHistory.map(r => `${r.movie_title}-${r.showtime_start}`)).size;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(11, 11, 15);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    
    doc.setTextColor(253, 216, 53);
    doc.setFontSize(22);
    doc.text("Historial de Funciones - Cine", 14, 22);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`Total Ingresos: $${totalRevenue.toFixed(2)}`, 14, 32);
    doc.text(`Boletos Vendidos: ${totalTickets}`, 14, 38);
    doc.text(`Funciones Unicas: ${distinctShowtimes}`, 14, 44);
    
    let timeRangeText = 'Todos los tiempos';
    if(timeRange === 'today') timeRangeText = 'Hoy';
    if(timeRange === 'this_week') timeRangeText = 'Esta Semana';
    if(timeRange === 'this_month') timeRangeText = 'Este Mes';
    if(timeRange === 'last_month') timeRangeText = 'Mes Pasado';
    if(timeRange === 'this_year') timeRangeText = 'Este Año';
    doc.text(`Filtro: ${timeRangeText}`, 14, 50);

    const tableColumn = ["ID", "Cliente", "Pelicula", "Fecha", "Asientos", "Total"];
    const tableRows = [];

    filteredHistory.forEach(record => {
      if(record.status === 'active') {
        const recordData = [
          `#${record.reservation_id}`,
          record.user_name,
          record.movie_title,
          record.showtime_start ? new Date(record.showtime_start).toLocaleDateString() : 'N/A',
          record.seats,
          `$${record.total_price.toFixed(2)}`
        ];
        tableRows.push(recordData);
      }
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 56,
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 34], textColor: [255, 255, 255] },
      bodyStyles: { fillColor: [18, 18, 23], textColor: [200, 200, 200] },
      alternateRowStyles: { fillColor: [22, 22, 28] },
      styles: { lineColor: [31, 31, 39], lineWidth: 0.1 }
    });

    doc.save(`reporte_historial_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Historial de Funciones</h2>
          <p className="text-gray-400">Revisa todas las compras y reservas realizadas.</p>
        </div>
        <button 
          onClick={downloadPDF}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#fdd835] text-black rounded-lg text-sm font-bold hover:bg-[#fff04d] transition-colors shadow-[0_0_15px_rgba(253,216,53,0.3)]"
        >
          <span>📄</span> Descargar Reporte (PDF)
        </button>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121217] border border-[#1f1f27] rounded-xl p-6 relative overflow-hidden group hover:border-[#fdd835]/30 transition-colors">
          <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Ingresos</div>
          <div className="text-3xl font-black text-white">${totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-[#121217] border border-[#1f1f27] rounded-xl p-6 relative overflow-hidden group hover:border-[#fdd835]/30 transition-colors">
          <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Boletos Vendidos</div>
          <div className="text-3xl font-black text-white">{totalTickets}</div>
        </div>
        <div className="bg-[#121217] border border-[#1f1f27] rounded-xl p-6 relative overflow-hidden group hover:border-[#fdd835]/30 transition-colors">
          <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Funciones</div>
          <div className="text-3xl font-black text-white">{distinctShowtimes}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Buscar por cliente, correo o película..." 
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="flex-1 p-3 rounded-xl bg-[#121217] border border-[#1f1f27] text-white focus:border-[#fdd835] focus:outline-none transition-colors"
        />
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-3 rounded-xl bg-[#121217] border border-[#1f1f27] text-white focus:border-[#fdd835] focus:outline-none transition-colors cursor-pointer"
        >
          <option value="all">Todo el tiempo</option>
          <option value="today">Hoy</option>
          <option value="this_week">Esta Semana</option>
          <option value="this_month">Este Mes</option>
          <option value="last_month">Mes Pasado</option>
          <option value="this_year">Este Año</option>
        </select>
      </div>
      
      <div className="bg-[#121217] border border-[#1f1f27] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando historial...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron reservas con los filtros aplicados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#1a1a22] text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-4 font-bold tracking-wider">ID</th>
                  <th className="p-4 font-bold tracking-wider">Cliente</th>
                  <th className="p-4 font-bold tracking-wider">Película</th>
                  <th className="p-4 font-bold tracking-wider">Fecha/Hora</th>
                  <th className="p-4 font-bold tracking-wider">Asientos</th>
                  <th className="p-4 font-bold tracking-wider">Total</th>
                  <th className="p-4 font-bold tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f27]">
                {filteredHistory.map((record, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-[#fdd835]">#{record.reservation_id}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{record.user_name}</div>
                      <div className="text-xs text-gray-400">{record.user_email}</div>
                    </td>
                    <td className="p-4 font-medium">{record.movie_title}</td>
                    <td className="p-4">
                      {record.showtime_start ? new Date(record.showtime_start).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-4 text-gray-300">{record.seats}</td>
                    <td className="p-4 font-bold text-green-400">${record.total_price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
