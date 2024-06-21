const calls = [
  { title: 'primer llamado', timer: '07:00' },
  { title: 'segundo llamado', timer: '08:00' },
  { title: 'tercer llamado', timer: '09:00' },
  { title: 'cuarto llamado', timer: '10:00' },
  { title: 'quinto llamado', timer: '11:00' },
  { title: 'sexto llamado', timer: '12:00' },
  { title: 'sétimo llamado', timer: '13:00' },
  { title: 'octavo llamado', timer: '14:00' },
  { title: 'noveno llamado', timer: '15:00' },
  { title: 'decimo llamado', timer: '16:00' },
  { title: 'undecimo llamado', timer: '17:00' },
  { title: 'duodecimo llamado', timer: '18:00' },
  { title: 'decimotercero llamado', timer: '19:00' },
  { title: 'decimocuarto llamado', timer: '20:00' },
  { title: 'decimoquinto llamado', timer: '21:00' },
  { title: 'decimosexto llamado', timer: '22:00' },
  { title: 'decimosetimo llamado', timer: '23:00' },
];

const users = [
  {
    dni: '71008085',
    id: 31,
  },
  {
    dni: '71252646',
    id: 18,
  },
  {
    dni: '73670226',
    id: 17,
  },
  {
    dni: '46823872',
    id: 9,
  },
  {
    dni: '00000001',
    id: 1,
  },
  {
    dni: '73822969',
    id: 26,
  },
  {
    dni: '48257704',
    id: 20,
  },
  {
    dni: '70090051',
    id: 13,
  },
  {
    dni: '71946593',
    id: 91,
  },
  {
    dni: '76137511',
    id: 3,
  },
  {
    dni: '75968043',
    id: 19,
  },
  {
    dni: '73768869',
    id: 8,
  },
  {
    dni: '70405206',
    id: 16,
  },
  {
    dni: '74154730',
    id: 88,
  },
  {
    dni: '77813707',
    id: 94,
  },
  {
    dni: '43287146',
    id: 84,
  },
  {
    dni: '74802505',
    id: 22,
  },
  {
    dni: '71024803',
    id: 24,
  },
  {
    dni: '70146985',
    id: 32,
  },
  {
    dni: '73520253',
    id: 2,
  },
  {
    dni: '75106955',
    id: 79,
  },
  {
    dni: '45574308',
    id: 6,
  },
  {
    dni: '70842754',
    id: 25,
  },
  {
    dni: '70850746',
    id: 23,
  },
  {
    dni: '72883345',
    id: 5,
  },
  {
    dni: '72672430',
    id: 38,
  },
  {
    dni: '76867152',
    id: 11,
  },
  {
    dni: '74172387',
    id: 50,
  },
  {
    dni: '73504608',
    id: 85,
  },
  {
    dni: '75418837',
    id: 36,
  },
  {
    dni: '72359834',
    id: 58,
  },
  {
    dni: '70617057',
    id: 83,
  },
  {
    dni: '70459562',
    id: 56,
  },
  {
    dni: '71741906',
    id: 41,
  },
  {
    dni: '73616804',
    id: 92,
  },
  {
    dni: '73022977',
    id: 59,
  },
  {
    dni: '75200060',
    id: 55,
  },
  {
    dni: '01319091',
    id: 51,
  },
  {
    dni: '73587126',
    id: 43,
  },
  {
    dni: '71981638',
    id: 75,
  },
  {
    dni: '71046679',
    id: 15,
  },
  {
    dni: '70335420',
    id: 14,
  },
  {
    dni: '73382399',
    id: 10,
  },
  {
    dni: '73738879',
    id: 93,
  },
  {
    dni: '44622486',
    id: 46,
  },
  {
    dni: '70090038',
    id: 48,
  },
  {
    dni: '75249688',
    id: 89,
  },
  {
    dni: '74541064',
    id: 90,
  },
  {
    dni: '70163360',
    id: 39,
  },
  {
    dni: '73740586',
    id: 53,
  },
  {
    dni: '71449908',
    id: 4,
  },
  {
    dni: '75896726',
    id: 49,
  },
  {
    dni: '48178565',
    id: 57,
  },
  {
    dni: '80296252',
    id: 45,
  },
  {
    dni: '70412578',
    id: 47,
  },
  {
    dni: '72622730',
    id: 54,
  },
  {
    dni: '74151892',
    id: 27,
  },
  {
    dni: '45557548',
    id: 35,
  },
  {
    dni: '75796255',
    id: 42,
  },
  {
    dni: '70511900',
    id: 44,
  },
  {
    dni: '71953875',
    id: 30,
  },
  {
    dni: '70170585',
    id: 7,
  },
  {
    dni: '47092277',
    id: 29,
  },
  {
    dni: '70501283',
    id: 12,
  },
  {
    dni: '74172380',
    id: 60,
  },
  {
    dni: '71019727',
    id: 52,
  },
  {
    dni: '72947410',
    id: 33,
  },
  {
    dni: '70297021',
    id: 34,
  },
  {
    dni: '76606543',
    id: 78,
  },
  {
    dni: '71335505',
    id: 72,
  },
  {
    dni: '73952368',
    id: 71,
  },
  {
    dni: '74224158',
    id: 98,
  },
  {
    dni: '74222947',
    id: 86,
  },
  {
    dni: '70259987',
    id: 87,
  },
  {
    dni: '76737223',
    id: 21,
  },
  {
    dni: '75848324',
    id: 95,
  },
  {
    dni: '74574465',
    id: 100,
  },
  {
    dni: '71925266',
    id: 77,
  },
  {
    dni: '71864604',
    id: 74,
  },
  {
    dni: '70323282',
    id: 96,
  },
  {
    dni: '75536839',
    id: 40,
  },
  {
    dni: '77070253',
    id: 97,
  },
  {
    dni: '74642870',
    id: 73,
  },
  {
    dni: '70147911',
    id: 99,
  },
  {
    dni: '75252668',
    id: 28,
  },
  {
    dni: '71067404',
    id: 101,
  },
  {
    dni: '72077133',
    id: 102,
  },
];

const mapStates = {
  PUNTUAL: 'P',
  TARDE: 'T',
  SIMPLE: 'F',
  GRAVE: 'G',
  MUY_GRAVE: 'M',
  PERMISO: 'L',
  SALIDA: 'S',
};
function getState(receive) {
  const ended = Object.keys(mapStates).find(key => mapStates[key] === receive);
  return ended || receive;
}
export const transformFix = (date, data) => {
  const filtered = data.map(({ dni, asistencia }) => {
    const a = users.find(x => x.dni === dni);
    return { id: a?.id, asistencia };
  });
  const maxAsistenciasLength = Math.max(
    ...filtered.map(item => item.asistencia.length)
  );
  const transformedCalls = calls.slice(0, maxAsistenciasLength);
  return transformedCalls.map(call => {
    const transformedData = filtered
      .map(item => {
        if (
          call.timer &&
          item.asistencia.length > transformedCalls.indexOf(call)
        ) {
          const statusKey = item.asistencia[transformedCalls.indexOf(call)];
          return {
            usersId: item.id,
            status: getState(statusKey),
            assignedAt: `${date}T${call.timer}`,
          };
        } else {
          return null;
        }
      })
      .filter(Boolean);

    return {
      title: call.title,
      timer: call.timer,
      createdAt: `${date}T${call.timer}`,
      updatedAt: `${date}T${call.timer}`,
      data: transformedData,
    };
  });
};
