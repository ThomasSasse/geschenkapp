import { useState } from 'react';

const initialData = [
  { name: 'Familie 1', active: true, contribution: 0 },
  { name: 'Familie 2', active: true, contribution: 0 },
  { name: 'Familie 3', active: true, contribution: 0 },
  { name: 'Familie 4', active: true, contribution: 0 },
];

export default function GeschenkApp() {
  const [data, setData] = useState(initialData);

  const handleChange = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = field === 'contribution' ? parseFloat(value) || 0 : value;
    setData(newData);
  };

  const activePeople = data.filter(p => p.active);
  const total = activePeople.reduce((sum, p) => sum + p.contribution, 0);
  const average = activePeople.length ? total / activePeople.length : 0;

  const getPayments = () => {
    const creditors = activePeople.map(p => ({ ...p })).filter(p => p.contribution > average);
    const debtors = activePeople.filter(p => p.contribution < average);
    const payments = [];

    for (let debtor of debtors) {
      let amountOwed = average - debtor.contribution;
      for (let creditor of creditors) {
        const creditorOver = creditor.contribution - average;
        const portion = Math.min(amountOwed, creditorOver);
        if (portion > 0) {
          payments.push({ from: debtor.name, to: creditor.name, amount: portion });
          amountOwed -= portion;
          creditor.contribution -= portion;
        }
        if (amountOwed <= 0) break;
      }
    }
    return payments;
  };

  const payments = getPayments();

  return (
    <div style={{
      fontFamily: 'sans-serif',
      backgroundImage: 'url(assets/background.png)',
      backgroundSize: 'cover',
      minHeight: '100vh',
      padding: '2rem',
      backgroundPosition: 'center'
    }}>
      <div style={{
        maxWidth: 900,
        margin: 'auto',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 0 15px rgba(0,0,0,0.2)'
      }}>
        <img src="assets/header.png" alt="Header" style={{ width: '100%', borderRadius: '1rem', marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦 Geschenk-Abrechnung für Familiengemeinschaft</h1>
        <p style={{ fontSize: '1rem', marginBottom: '2rem' }}>Hallo liebe <strong>WSF</strong>- und <strong>Playmobilfunk</strong>-Freunde!<br />Tragt unten ein, wie viel ihr ausgegeben habt. Die App zeigt euch automatisch, wie es ausgeglichen werden kann 🍷🎂</p>

        {data.map((person, index) => (
          <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <input type="checkbox" checked={person.active} onChange={(e) => handleChange(index, 'active', e.target.checked)} />
            <input type="text" value={person.name} onChange={(e) => handleChange(index, 'name', e.target.value)} placeholder="Name" style={{ flex: 1 }} />
            <input type="number" value={person.contribution} onChange={(e) => handleChange(index, 'contribution', e.target.value)} style={{ width: '100px' }} />
            <span style={{ width: '100px' }}>Saldo: {(person.contribution - average).toFixed(2)} €</span>
          </div>
        ))}

        <button onClick={() => setData([...data, { name: `Familie ${data.length + 1}`, active: true, contribution: 0 }])} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#9f1239', color: 'white', border: 'none', borderRadius: '6px' }}>
          ➕ Familie hinzufügen
        </button>

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>💸 Zahlungen</h2>
          {payments.length === 0 ? (
            <p>Alle Beiträge sind ausgeglichen.</p>
          ) : (
            <ul>
              {payments.map((p, i) => (
                <li key={i}>{p.from} zahlt {p.amount.toFixed(2)} € an {p.to}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
